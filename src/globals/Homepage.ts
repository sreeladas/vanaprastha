import type { GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: {
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Introduction text displayed below the Vanaprastha title',
      },
    },
  ],
}