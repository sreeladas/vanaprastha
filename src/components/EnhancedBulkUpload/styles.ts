export const styles = {
  // Layout containers
  flexContainer: {
    display: 'flex' as const,
    gap: '1rem',
    flex: '1 1 0%',
  },

  flexContainerVertical: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '1rem',
  },

  flexContainerHorizontal: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '0.5rem',
  },

  // Grid layouts
  gridContainer: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.5rem',
  },

  // Card styles
  cardContainer: {
    padding: '1rem',
    border: '1px solid hsl(0, 0%, 15%)',
    borderRadius: '0.5rem',
    backgroundColor: 'hsl(0, 0%, 4%)',
    color: 'hsl(210, 40%, 98%)',
  },

  // Form elements
  inputField: {
    flex: '1 1 0%',
    padding: '2px',
    border: '1px solid hsl(0, 0%, 15%)',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    height: '60px',
    minWidth: '0',
    backgroundColor: 'hsl(217.2, 32.6%, 17.5%)',
    color: 'hsl(210, 40%, 98%)',
  },

  // Spacing utilities
  spacingVertical: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '1rem',
  },

  // Thumbnail styles
  thumbnailContainer: {
    width: '4rem',
    height: '4rem',
    flexShrink: 0,
    objectFit: 'cover' as const,
    borderRadius: '0.375rem',
  },

  // Modal styles
  modalContainer: {
    minWidth: '80vw',
    maxWidth: '100%',
    width: '90vw',
    backgroundColor: 'hsl(0, 0%, 4%)',
    color: 'hsl(210, 40%, 98%)',
    border: '1px solid hsl(0, 0%, 15%)',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    position: 'relative' as const,
    margin: 'auto',
    transform: 'translateY(50%)',
    top: '50%',
  },

  closeButton: {
    position: 'absolute' as const,
    top: '1rem',
    right: '1rem',
    background: 'transparent',
    border: 'none',
    color: 'hsl(210, 40%, 98%)',
    cursor: 'pointer',
    fontSize: '1.5rem',
    padding: '0.25rem',
    borderRadius: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
  },
}
