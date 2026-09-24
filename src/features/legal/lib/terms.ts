import { SITE } from '@/lib/site';
import type { LegalDocumentContent } from './types';

/**
 * Texto de referencia con estructura legal real.
 * Antes de producción lo tiene que revisar un abogado colegiado en el Perú.
 */
export const TERMS: LegalDocumentContent = {
  title: 'Términos y condiciones',
  description: `Las reglas para publicar y adoptar mascotas en ${SITE.name}: qué hacemos, qué no hacemos y qué esperamos de cada persona.`,
  updatedAt: { iso: '2026-09-23', label: '23 de septiembre de 2026' },
  summary: [
    `${SITE.name} es una herramienta para conectar personas. No somos dueños de las mascotas ni parte de la adopción.`,
    'Publicar y adoptar es gratis. Está prohibido vender animales o pedir dinero por ellos.',
    'Tú eres responsable de que lo que publicas sea verdad.',
    'Puedes pausar o borrar tu publicación cuando quieras.',
  ],
  sections: [
    {
      id: 'aceptacion',
      title: 'Aceptación de los términos',
      body: [
        `Estos Términos y condiciones regulan el uso del sitio y los servicios de ${SITE.name} (en adelante, "la Plataforma"). Al publicar una mascota, contactar a una familia o navegar el sitio, aceptas estos términos y la Política de Privacidad.`,
        'Si no estás de acuerdo con alguna parte, te pedimos que no uses la Plataforma. Para publicar tienes que ser mayor de 18 años o contar con autorización de tu madre, padre o tutor.',
      ],
    },
    {
      id: 'intermediario',
      title: `${SITE.name} como intermediario tecnológico`,
      body: [
        `${SITE.name} es exclusivamente un intermediario tecnológico: ofrece un espacio para que quien necesita dar una mascota en adopción y quien quiere adoptarla se encuentren y conversen de forma segura.`,
        `${SITE.name} no es propietario, tenedor ni custodio de ninguna mascota publicada; no interviene en el acuerdo entre las partes; no garantiza el estado de salud, el comportamiento ni la veracidad de la información de cada publicación; y no es parte de ningún contrato, traspaso o compromiso que las partes celebren entre sí.`,
        'La decisión de entregar o adoptar una mascota, y las condiciones en que se hace, corresponden únicamente a las personas involucradas.',
      ],
    },
    {
      id: 'publicaciones',
      title: 'Publicaciones',
      body: [
        'Quien publica declara que:',
        {
          list: [
            'Tiene derecho a dar en adopción a la mascota publicada.',
            'La información sobre edad, salud, comportamiento y necesidades especiales es verdadera y completa según su conocimiento.',
            'Las fotos son propias o tiene permiso para usarlas, y muestran a la mascota real.',
          ],
        },
        'Revisamos cada publicación antes de mostrarla. Podemos rechazar, pausar o dar de baja publicaciones que incumplan estos términos, sin necesidad de aviso previo.',
      ],
    },
    {
      id: 'conductas-prohibidas',
      title: 'Conductas prohibidas',
      body: [
        'En la Plataforma no está permitido:',
        {
          list: [
            'Vender, comprar o pedir cualquier tipo de pago, "donación obligatoria" o compensación a cambio de una mascota.',
            'Publicar fauna silvestre o especies cuya tenencia esté prohibida por la ley peruana.',
            'Publicar o promover cualquier forma de maltrato animal, en los términos de la Ley N.° 30407, Ley de Protección y Bienestar Animal.',
            'Usar la mensajería para acosar, discriminar, hacer spam o pedir datos personales con fines ajenos a la adopción.',
            'Crear publicaciones falsas o hacerse pasar por otra persona u organización.',
          ],
        },
      ],
    },
    {
      id: 'contacto-entre-usuarios',
      title: 'Contacto entre usuarios',
      body: [
        'Quien quiere adoptar se postula con una carta de presentación (nombre, distrito y tipo de hogar) y la conversación sigue por el chat interno de la Plataforma. Los datos de contacto (teléfono, email) de quien publica permanecen ocultos hasta que esa persona decide compartirlos.',
        `Recomendamos conocerse en un lugar seguro, visitar el hogar adoptante y firmar un acta de adopción responsable. ${SITE.name} puede ofrecer modelos orientativos, pero no los redacta a medida ni los certifica.`,
      ],
    },
    {
      id: 'arrepentimiento',
      title: 'Pausa, baja y arrepentimiento',
      body: [
        'Puedes pausar o eliminar tu publicación en cualquier momento antes de concretar la adopción, sin dar explicaciones. Una vez que la mascota fue entregada, cualquier acuerdo posterior es exclusivamente entre las partes.',
      ],
    },
    {
      id: 'responsabilidad',
      title: 'Limitación de responsabilidad',
      body: [
        `En la máxima medida permitida por la ley, ${SITE.name} no será responsable por daños directos o indirectos que surjan de la relación entre usuarios, de la información publicada por terceros, ni del estado de salud o comportamiento de las mascotas.`,
        'Nada de lo anterior limita los derechos que te reconoce la Ley N.° 29571, Código de Protección y Defensa del Consumidor.',
      ],
    },
    {
      id: 'propiedad-intelectual',
      title: 'Propiedad intelectual',
      body: [
        `La marca, el diseño y el software de ${SITE.name} nos pertenecen. Las fotos y textos que publicas siguen siendo tuyos; nos otorgas una licencia gratuita y no exclusiva para mostrarlos en la Plataforma y en las vistas previas al compartir la publicación, mientras esté activa.`,
      ],
    },
    {
      id: 'cambios',
      title: 'Cambios en los términos',
      body: [
        'Podemos actualizar estos términos. Si el cambio es importante, te avisamos con al menos 15 días de anticipación por email o dentro de la Plataforma. Seguir usándola después de esa fecha implica aceptar la nueva versión.',
      ],
    },
    {
      id: 'ley-aplicable',
      title: 'Ley aplicable y jurisdicción',
      body: [
        'Estos términos se rigen por las leyes de la República del Perú. Ante cualquier conflicto, serán competentes los jueces y tribunales de Lima Metropolitana, sin perjuicio de tu derecho a acudir al INDECOPI como consumidor.',
      ],
    },
  ],
  contactEmail: SITE.contactEmail,
  related: { prefix: 'nuestra', label: 'Política de Privacidad', href: '/privacidad' },
};
