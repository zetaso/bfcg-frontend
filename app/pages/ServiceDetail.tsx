import React from 'react'
import ServiceDetailComponent from '../components/services/ServiceDetailComponent'

export default function ServiceDetail({ params }: { params: { slug: string } }) {
  return (
    <ServiceDetailComponent slug={params.slug}/>
  )
}
