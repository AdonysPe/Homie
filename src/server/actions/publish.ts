'use server';

import { randomBytes, randomUUID } from 'node:crypto';

import { revalidatePath } from 'next/cache';

import { buildHighlight } from '@/features/publish/lib/build-listing';
import { MAX_PHOTOS, publishPayloadSchema } from '@/features/publish/lib/publish-schema';
import { actionError, actionOk, type ActionResult } from '@/lib/action-result';
import { formatAge, slugify } from '@/lib/format';
import { speciesHasSize, speciesLabel } from '@/lib/pet-catalog';
import { getDb, schema } from '../db';
import { requireVerifiedUser } from '../session';

/** Las fotos llegan ya redimensionadas desde el navegador: esto es un tope de seguridad. */
const MAX_UPLOAD_BYTES = 1.5 * 1024 * 1024;

/** Detecta el formato por su firma binaria: el `type` del archivo lo decide el cliente. */
function sniffImageType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff === 'RIFF' && webp === 'WEBP') return 'image/webp';
  return null;
}

async function readPhotos(formData: FormData) {
  const files = formData.getAll('photos').filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) return actionError('Sube al menos una foto.', 'invalid');
  if (files.length > MAX_PHOTOS) return actionError(`Máximo ${MAX_PHOTOS} fotos.`, 'invalid');

  const photos: { data: Uint8Array; mimeType: string }[] = [];
  for (const file of files) {
    if (file.size > MAX_UPLOAD_BYTES) return actionError('Una de las fotos es demasiado pesada.', 'invalid');
    const data = new Uint8Array(await file.arrayBuffer());
    const mimeType = sniffImageType(data);
    if (!mimeType) return actionError('Una de las fotos no es una imagen válida.', 'invalid');
    photos.push({ data, mimeType });
  }
  return photos;
}

/**
 * Crea una publicación. Recibe `FormData` con:
 * - `payload`: JSON con los campos del formulario (validado con el mismo esquema que el cliente).
 * - `photos`: hasta 5 imágenes, en orden (la primera es la principal).
 */
export async function publishPet(formData: FormData): Promise<ActionResult<{ slug: string }>> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return auth;

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get('payload') ?? ''));
  } catch {
    return actionError('No pudimos leer el formulario. Prueba de nuevo.', 'invalid');
  }

  const parsed = publishPayloadSchema.safeParse(raw);
  if (!parsed.success) return actionError(parsed.error.issues[0].message, 'invalid');
  const values = parsed.data;

  const photos = await readPhotos(formData);
  if (!Array.isArray(photos)) return photos;

  const petId = randomUUID();
  const name = values.name.trim();
  const slug = `${slugify(name)}-${slugify(values.city)}-${randomBytes(3).toString('hex')}`;
  const altBase = `${name}, ${speciesLabel(values.species).toLowerCase()}`;
  const photoRows = photos.map((photo, index) => ({
    id: randomUUID(),
    petId,
    mimeType: photo.mimeType,
    data: photo.data,
    alt: index === 0 ? `${altBase}, foto principal subida por su familia` : `${altBase}, foto ${index + 1}`,
  }));

  const db = await getDb();
  await db.transaction(async (tx) => {
    await tx.insert(schema.pets).values({
      id: petId,
      slug,
      ownerId: auth.user.id,
      name,
      species: values.species,
      sex: values.sex,
      ageLabel: formatAge(values.ageValue, values.ageUnit),
      size: speciesHasSize(values.species) ? (values.size ?? null) : null,
      city: values.city.trim(),
      photos: photoRows.map((photo) => ({ url: `/api/fotos/${photo.id}`, alt: photo.alt })),
      highlight: buildHighlight(values),
      description: values.description?.trim() || null,
      sterilized: values.isSterilized,
      vaccinated: values.isVaccinated,
      dewormed: values.isDewormed,
      hasMicrochip: values.hasMicrochip,
      microchipNumber: values.hasMicrochip ? values.microchipNumber?.replace(/\s/g, '') || null : null,
      specialNeeds: values.specialNeeds?.trim() || null,
      idealHome: values.idealHome,
      goodWithKids: values.goodWithKids,
      goodWithPets: values.goodWithPets,
      reason: values.reason,
      ownerName: values.ownerName.trim(),
      contactMethod: values.contactMethod,
      contactValue: values.contactValue.trim(),
    });
    await tx.insert(schema.petPhotos).values(
      photoRows.map(({ id, mimeType, data }) => ({ id, petId, mimeType, data })),
    );
  });

  revalidatePath('/');
  revalidatePath('/dashboard');
  return actionOk({ slug });
}
