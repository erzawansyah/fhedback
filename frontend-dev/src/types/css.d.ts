// Global CSS Module Type Declarations
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.sass' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.less' {
  const classes: { [key: string]: string }
  export default classes
}

// Regular CSS files
declare module '*.css' {
  const content: string
  export default content
}

declare module '*.scss' {
  const content: string
  export default content
}

declare module '*.sass' {
  const content: string
  export default content
}

declare module '*.less' {
  const content: string
  export default content
}

// PostCSS
declare module '*.pcss' {
  const content: string
  export default content
}

// Stylus
declare module '*.styl' {
  const content: string
  export default content
}

declare module '*.stylus' {
  const content: string
  export default content
}
