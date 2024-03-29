'use client';
import Breadcrumbs from '@/app/ui/shared/breadcrumbs';
import { notFound } from 'next/navigation';
import requireAuth from '@/atuh';
import { VariablesOf, graphql } from '@/graphql';
import { useQuery } from '@apollo/client';
import MediasTable from '@/app/ui/medias/table';
import { CreateMedia } from '@/app/ui/medias/buttons';
import { useEffect } from 'react';

const getPlaceById = graphql(`
  query Query($placeId: ID!) {
    place(id: $placeId) {
      id
      name
    }
  }
`);

const getMediasOfPlace = graphql(`
  query Query($placeId: ID, $language: Language) {
    medias(placeId: $placeId, language: $language) {
      id
      title
      type
      url
      text
    }
  }
`);

function Page({ params }: { params: { id: string } }) {
  const id = params.id;

  const variablesPlaces: VariablesOf<typeof getPlaceById> = {
    placeId: id,
  };

  const variablesMediaQuery: VariablesOf<typeof getMediasOfPlace> = {
    placeId: id,
  };

  const {
    loading: placeLoading,
    error: placeError,
    data: placeData,
  } = useQuery(getPlaceById, {
    variables: variablesPlaces,
  });

  const {
    loading: mediasLoading,
    error: mediasError,
    data: mediasData,
    refetch: mediasRefetch,
  } = useQuery(getMediasOfPlace, {
    variables: variablesMediaQuery,
  });

  useEffect(() => {
    mediasRefetch();
  });

  const place = placeData?.place;
  const medias = mediasData?.medias;

  if (placeLoading || mediasLoading) {
    return <p>Carregant...</p>;
  }

  if (placeError || mediasError) {
    notFound();
  }
  const mediasArray: Media[] = [];
  if (!medias) {
    console.log('No medias');
  } else {
    for (const media of medias) {
      mediasArray.push({
        id: media?.id ? media.id.toString() : '',
        title: media?.title ? media.title.toString() : '',
        type: media?.type ? media.type.toString() : '',
        url: media?.url ? media.url.toString() : '',
        text: media?.text ? media.text.toString() : '',
      });
    }
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Llocs', href: '/dashboard/places' },
          {
            label: `Recursos`,
            href: `/dashboard/places/${id}/medias`,
            active: true,
          },
        ]}
      />
      <h1 className="font text-3xl font-medium text-monum-green-800">
        {place?.name}
      </h1>
      <CreateMedia placeId={id} />
      <MediasTable medias={mediasArray} />
    </main>
  );
}

export default requireAuth(Page);
