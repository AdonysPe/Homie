'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { REVIEW_COMMENT_MAX } from '@/features/reviews/lib/review-schema';
import { submitReview } from '@/server/actions/reviews';
import type { Thread } from '@/server/messages';
import { StarRating } from './StarRating';
import { StarRatingInput } from './StarRatingInput';

/** Solo aparece con la adopción ya `completada`: calificar o ver la reseña ya dejada. */
export function ReviewSection({ thread }: { thread: Thread }) {
  if (thread.request.status !== 'completada') return null;

  return (
    <section className="flex flex-col gap-3 rounded-panel border border-cream-300 bg-white p-5 shadow-soft">
      <h2 className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink-900">
        Reseña de esta adopción
      </h2>
      {thread.myReview ? (
        <SubmittedReview review={thread.myReview} counterpartId={thread.counterpartId} />
      ) : (
        <ReviewForm requestId={thread.id} counterpart={thread.counterpart} />
      )}
    </section>
  );
}

function SubmittedReview({
  review,
  counterpartId,
}: {
  review: { rating: number; comment: string };
  counterpartId: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <StarRating value={review.rating} />
      <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed text-ink-700">{review.comment}</p>
      <Link href={`/perfil/${counterpartId}`} className="text-sm font-medium text-clay-600 hover:text-clay-700">
        Ver el perfil de confianza →
      </Link>
    </div>
  );
}

function ReviewForm({ requestId, counterpart }: { requestId: string; counterpart: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    if (rating === 0) {
      toast.error('Elige de 1 a 5 estrellas.');
      return;
    }
    startTransition(async () => {
      const result = await submitReview({ requestId, rating, comment });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('¡Gracias por tu reseña!');
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-500">¿Cómo te fue con {counterpart}? Tu reseña es pública, sin tu nombre.</p>
      <StarRatingInput value={rating} onChange={setRating} />
      <label htmlFor="review-comment" className="sr-only">
        Tu reseña
      </label>
      <textarea
        id="review-comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={REVIEW_COMMENT_MAX}
        rows={3}
        placeholder="Cuéntanos cómo fue la experiencia…"
        className="min-h-[5rem] resize-none rounded-card border border-cream-400 bg-white px-4 py-3 text-[0.95rem] leading-snug placeholder:text-ink-300"
      />
      <Button size="md" onClick={submit} isLoading={isPending} className="self-start">
        Enviar reseña
      </Button>
    </div>
  );
}
