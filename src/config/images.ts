export const IMAGES = {
  logo: {
    main: 'https://images.pexels.com/photos/7516362/pexels-photo-7516362.jpeg?auto=compress&cs=tinysrgb&w=800&h=400',
    alt: 'Coffice - Coworking Space by HCC',
  },
  spaces: {
    coworking: {
      url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      alt: 'Espace de coworking moderne Coffice Alger',
    },
    meeting: {
      url: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      alt: 'Salle de réunion équipée Coffice',
    },
  },
  booths: {
    atlas: {
      url: 'https://images.pexels.com/photos/7516347/pexels-photo-7516347.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      alt: 'Private Booth Atlas - Bureau privé 4 places',
    },
    aures: {
      url: 'https://images.pexels.com/photos/6782567/pexels-photo-6782567.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      alt: 'Private Booth Aurès - Bureau privé 4 places',
    },
    hoggar: {
      url: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
      alt: 'Private Booth Hoggar - Bureau privé 3 places',
    },
  },
  backgrounds: {
    hero: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
    office: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
  },
  partners: {
    novihost: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.png?auto=compress&cs=tinysrgb&w=400&h=200',
  },
}

export const getImageUrl = (category: keyof typeof IMAGES, key?: string): string => {
  if (!key) {
    const item = IMAGES[category]
    if (typeof item === 'object' && 'url' in item) {
      return item.url
    }
    return ''
  }

  const categoryData = IMAGES[category] as any
  if (categoryData && categoryData[key]) {
    return categoryData[key].url || ''
  }

  return ''
}

export const getImageAlt = (category: keyof typeof IMAGES, key?: string): string => {
  if (!key) {
    const item = IMAGES[category]
    if (typeof item === 'object' && 'alt' in item) {
      return item.alt
    }
    return ''
  }

  const categoryData = IMAGES[category] as any
  if (categoryData && categoryData[key]) {
    return categoryData[key].alt || ''
  }

  return ''
}
