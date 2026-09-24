import { SITE } from '@/lib/site';
import type { LegalDocumentContent } from './types';

/**
 * Texto de referencia con estructura legal real (Ley N.° 29733, Ley de Protección de Datos Personales del Perú).
 * Antes de producción lo tiene que revisar un abogado colegiado en el Perú.
 */
export const PRIVACY: LegalDocumentContent = {
  title: 'Política de privacidad',
  description: `Qué datos recopila ${SITE.name}, para qué los usa y cómo puedes controlarlos. Tus datos, privados.`,
  updatedAt: { iso: '2026-09-23', label: '23 de septiembre de 2026' },
  summary: [
    'Tu teléfono y tu email nunca aparecen en una publicación.',
    'Los interesados se presentan con una carta y te escriben por el chat de la app: tú decides si compartes tu contacto y cuándo.',
    'No vendemos ni alquilamos tus datos. Nunca.',
    'Puedes pedir ver, corregir o borrar tus datos cuando quieras.',
  ],
  sections: [
    {
      id: 'responsable',
      title: 'Responsable del tratamiento',
      body: [
        `${SITE.name} es responsable del banco de datos personales con la información que nos das al usar la Plataforma, inscrito en el Registro Nacional de Protección de Datos Personales. Para cualquier consulta sobre privacidad, escríbenos a ${SITE.privacyEmail}.`,
      ],
    },
    {
      id: 'recopilacion',
      title: 'Recopilación de datos',
      body: [
        'Solo pedimos lo necesario para que la adopción funcione:',
        {
          list: [
            'Datos de la mascota: especie, nombre, edad, género, tamaño, estado de salud, necesidades especiales y fotos. Son públicos.',
            'Tus datos de contacto: nombre, ciudad y WhatsApp o email. Son privados.',
            'El número de microchip, si lo cargas. Es privado y solo se comparte con la familia adoptante.',
            'El motivo por el que das en adopción. Es privado y solo lo usamos para mejorar el servicio.',
            'Datos técnicos básicos (tipo de navegador, páginas visitadas) de forma agregada, para detectar errores y abusos.',
          ],
        },
      ],
    },
    {
      id: 'uso',
      title: 'Uso de los datos',
      body: [
        'Usamos tus datos únicamente para:',
        {
          list: [
            'Mostrar la publicación de tu mascota.',
            'Avisarte cuando alguien se postula y permitir la conversación por el chat interno.',
            'Revisar publicaciones y prevenir fraudes, venta de animales o maltrato.',
            'Acompañarte durante la adopción, si nos diste permiso.',
          ],
        },
        'No usamos tus datos para publicidad de terceros ni tomamos decisiones automatizadas que te afecten.',
      ],
    },
    {
      id: 'datos-ocultos',
      title: 'Datos ocultos por defecto',
      body: [
        'Tu teléfono y tu email nunca se muestran en la publicación ni se envían a los interesados de forma automática. La conversación empieza con la carta de presentación del interesado y sigue por el chat interno de la Plataforma, y solo cuando tú eliges "revelar contacto" la otra persona puede verlos.',
      ],
    },
    {
      id: 'compartir',
      title: 'Con quién compartimos datos',
      body: [
        'No vendemos, alquilamos ni cedemos tus datos. Solo los compartimos con:',
        {
          list: [
            'Proveedores que nos ayudan a operar (alojamiento, envío de emails), bajo contratos de confidencialidad y solo con lo mínimo necesario.',
            'Autoridades, cuando una ley u orden judicial nos obligue.',
          ],
        },
      ],
    },
    {
      id: 'conservacion',
      title: 'Conservación y seguridad',
      body: [
        'Guardamos tus datos mientras tu publicación esté activa y hasta 12 meses después, para resolver consultas o reclamos. Luego los eliminamos o anonimizamos.',
        'Aplicamos medidas técnicas razonables (cifrado en tránsito, accesos restringidos) para protegerlos. Ningún sistema es infalible: si ocurriera un incidente que te afecte, te lo vamos a informar.',
      ],
    },
    {
      id: 'consentimiento',
      title: 'Consentimiento del usuario',
      body: [
        'Al marcar la casilla "He leído y acepto los Términos y la Política de Privacidad" al publicar, das tu consentimiento libre, expreso e informado para el tratamiento de tus datos según esta política.',
        'Puedes retirar tu consentimiento en cualquier momento eliminando tu publicación o escribiéndonos. Retirarlo no afecta el tratamiento realizado antes.',
      ],
    },
    {
      id: 'derechos',
      title: 'Tus derechos',
      body: [
        `Tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos personales (derechos ARCO), según la Ley N.° 29733 y su Reglamento. Para ejercerlos, escribe a ${SITE.privacyEmail}; respondemos dentro de los plazos que establece el Reglamento.`,
        'Si consideras que no atendimos tu solicitud, puedes presentar un reclamo ante la Autoridad Nacional de Protección de Datos Personales del Ministerio de Justicia y Derechos Humanos.',
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies',
      body: [
        'Usamos solo cookies técnicas, necesarias para que el sitio funcione. No usamos cookies de publicidad ni de seguimiento entre sitios.',
      ],
    },
    {
      id: 'cambios',
      title: 'Cambios en esta política',
      body: [
        'Si cambiamos algo importante, te avisamos con anticipación. La fecha de "última actualización" siempre indica la versión vigente.',
      ],
    },
  ],
  contactEmail: SITE.privacyEmail,
  related: { prefix: 'los', label: 'Términos y condiciones', href: '/terminos' },
};
