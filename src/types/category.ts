export interface Tag {
  id: string
  name: string
}

export interface Category {
  id: string
  name: string
  tags: Tag[]
}
