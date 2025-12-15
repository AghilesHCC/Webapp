export const IMAGES = {
  logo: {
    main: 'https://images.pexels.com/photos/7516362/pexels-photo-7516362.jpeg?auto=compress&cs=tinysrgb&w=800&h=400',
    alt: 'Coffice - Coworking Space by HCC',
  },
  spaces: {
    coworking: {
      url: '/espace-coworking.jpeg',
      alt: 'Espace de coworking moderne Coffice Alger',
    },
    meeting: {
      url: '/salle-reunion.jpeg',
      alt: 'Salle de reunion equipee Coffice',
    },
  },
  booths: {
    atlas: {
      url: '/booth-atlas.jpeg',
      alt: 'Private Booth Atlas - Bureau prive 4 places',
    },
    aures: {
      url: '/booth-aures.jpeg',
      alt: 'Private Booth Aures - Bureau prive 4 places',
    },
    hoggar: {
      url: '/booth-hoggar.jpeg',
      alt: 'Private Booth Hoggar - Bureau prive 3 places',
    },
  },
  backgrounds: {
    hero: '/espace-coworking.jpeg',
    office: '/salle-reunion.jpeg',
  },
  partners: {
    novihost: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.png?auto=compress&cs=tinysrgb&w=400&h=200',
  },
}

export const getImageUrl = (category: keyof typeof IMAGES, key?: string): string => {
  if (!key) {
    const item = IMAGES[category] as Record<string, unknown>
    if (typeof item === 'object' && 'url' in item && typeof item.url === 'string') {
      return item.url
    }
    return ''
  }

  const categoryData = IMAGES[category] as Record<string, Record<string, string>>
  if (categoryData && categoryData[key]) {
    return categoryData[key].url || ''
  }

  return ''
}

export const getImageAlt = (category: keyof typeof IMAGES, key?: string): string => {
  if (!key) {
    const item = IMAGES[category] as Record<string, unknown>
    if (typeof item === 'object' && 'alt' in item && typeof item.alt === 'string') {
      return item.alt
    }
    return ''
  }

  const categoryData = IMAGES[category] as Record<string, Record<string, string>>
  if (categoryData && categoryData[key]) {
    return categoryData[key].alt || ''
  }

  return ''
}
