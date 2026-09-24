'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { EyeIcon, EyeOffIcon, LockIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/Toast';
import { authClient } from '@/lib/auth-client';
import { SITE } from '@/lib/site';

type Mode = 'ingresar' | 'registro';

const email = z.email('Revisa el email (ej. nombre@correo.com)').trim().toLowerCase();

const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Escribe tu contraseña'),
});

const signUpSchema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre').max(40, 'Máximo 40 caracteres'),
  email,
  password: z
    .string()
    .min(8, 'Usa al menos 8 caracteres')
    .max(128, 'Máximo 128 caracteres'),
});

type AuthValues = { name?: string; email: string; password: string };

/** Traduce los códigos de Better Auth a mensajes humanos. */
const ERROR_MESSAGES: Record<string, string> = {
  USER_ALREADY_EXISTS: 'Ya existe una cuenta con ese email. Prueba ingresar.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Ya existe una cuenta con ese email. Prueba ingresar.',
  INVALID_EMAIL_OR_PASSWORD: 'El email o la contraseña no coinciden.',
  PASSWORD_TOO_SHORT: 'La contraseña es demasiado corta.',
  PASSWORD_TOO_LONG: 'La contraseña es demasiado larga.',
  INVALID_EMAIL: 'Revisa el email.',
};

export function AuthForm({ mode, returnTo }: { mode: Mode; returnTo: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const isSignUp = mode === 'registro';

  const form = useForm<AuthValues>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onTouched',
  });
  const { register, formState } = form;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    const { error } = isSignUp
      ? await authClient.signUp.email({
          name: values.name ?? '',
          email: values.email,
          password: values.password,
          // A dónde vuelve quien toca el enlace del email de confirmación.
          callbackURL: '/cuenta-verificada',
        })
      : await authClient.signIn.email({ email: values.email, password: values.password });

    if (error) {
      const message =
        (error.code && ERROR_MESSAGES[error.code]) ||
        (error.status === 429 ? 'Demasiados intentos. Espera un minuto.' : 'Algo salió mal. Prueba de nuevo.');
      setFormError(message);
      return;
    }

    toast.success(isSignUp ? 'Cuenta creada. Te enviamos un email para confirmarla.' : '¡Hola de nuevo!');
    router.push(returnTo);
    router.refresh();
  });

  const otherHref = `/${isSignUp ? 'ingresar' : 'registro'}${returnTo !== '/' ? `?volver=${encodeURIComponent(returnTo)}` : ''}`;

  return (
    <div className="surface w-full max-w-md p-6 sm:p-8">
      <h1 className="text-display-sm font-display">{isSignUp ? 'Crea tu cuenta' : 'Ingresa a tu cuenta'}</h1>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-500">
        {isSignUp
          ? 'Para publicar y escribirle a otras familias. Gratis, siempre.'
          : `Sigue donde dejaste en ${SITE.name}.`}
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-7 flex flex-col gap-4">
        {isSignUp ? (
          <TextField
            label="Nombre"
            autoComplete="given-name"
            error={formState.errors.name?.message}
            {...register('name')}
          />
        ) : null}
        <TextField
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          error={formState.errors.email?.message}
          {...register('email')}
        />
        <div className="relative">
          <TextField
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            hint={isSignUp ? 'Mínimo 8 caracteres.' : undefined}
            className="pr-12"
            error={formState.errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={showPassword}
            className="absolute right-2 top-[1.85rem] flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-cream-200 hover:text-ink-700"
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        </div>

        <FieldError message={formError ?? undefined} />

        <Button type="submit" size="lg" fullWidth isLoading={formState.isSubmitting} className="mt-2">
          {isSignUp ? 'Crear cuenta' : 'Ingresar'}
        </Button>
      </form>

      {isSignUp ? (
        <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-ink-400">
          <LockIcon size={14} className="mt-0.5 shrink-0 text-sage-600" />
          <span>
            Tu email nunca se muestra a otras personas. Al crear la cuenta aceptas los{' '}
            <Link href="/terminos" className="legal-link">
              Términos
            </Link>{' '}
            y la{' '}
            <Link href="/privacidad" className="legal-link">
              Política de Privacidad
            </Link>
            .
          </span>
        </p>
      ) : null}

      <p className="mt-6 border-t border-cream-300 pt-5 text-center text-sm text-ink-500">
        {isSignUp ? '¿Ya tienes cuenta?' : `¿Primera vez en ${SITE.name}?`}{' '}
        <Link href={otherHref} className="font-semibold text-clay-600 hover:text-clay-700">
          {isSignUp ? 'Ingresa' : 'Crea tu cuenta'}
        </Link>
      </p>
    </div>
  );
}
