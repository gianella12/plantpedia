import { getPlant, getPlantList, getCategoryList } from '@api'
import { Layout } from '@components/Layout'
import { Typography } from '@ui/Typography'
import { Grid } from '@ui/Grid'

import { RichText } from '@components/RichText'
import { AuthorCard } from '@components/AuthorCard'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { PlantEntryInline } from '@components/PlantCollection'
import { Link } from '@material-ui/core'
import { useRouter } from 'next/router'
type PathType = {
    params: {
        slug: string
    }
}

export const getStaticPaths = async () => {
    const entries = await getPlantList({ limit: 10 })


    const paths: PathType[] = entries.map(plant => ({
        params: {
            slug: plant.slug
        }
    }))

    return {
        paths,


        //404 en las entradas que no fueron encntradas 
        fallback: true,
    }
}


type PlantEntryPageProps = {
    plant: Plant ;
    otherEntries: Plant[] ;
    categories: Category[] ;
}

export const getStaticProps: GetStaticProps<PlantEntryPageProps> = async ({ params }) => {
    const slug = params?.slug


    if (typeof slug !== 'string') {
        return {
            notFound: true
        }
    }
    try {
        const plant = await getPlant(slug)
        const categories = await getCategoryList({ limit: 10 })
        const otherEntries = await getPlantList({ limit: 5 })

        return {
            props: {
                plant,
                categories,
                otherEntries,
            },
            revalidate: 5 * 60,
        }

    } catch (error) {
        return {
            notFound: true
        }
    }

}

export default function PlantEntryPage({ plant, categories, otherEntries }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  
    if (router.isFallback) {
        //next js esta cargando y solucionando  lo que este dentro de getstatic props
        return <Layout>
            <Typography variant="h2">Loading...</Typography>
        </Layout>
    }
    return (
        <Layout>
            <Grid container spacing={4}>
                <Grid item xs={12} md={8} lg={9} component="article">
                    <figure>
                        <img width={952} src={plant.image.url} alt={plant.image.title} />
                    </figure>
                    <div className="px-12 pt-8">
                        <Typography variant="h2">{plant.plantName}</Typography>
                    </div>
                    <div className="p-10">
                        <RichText richText={plant.description} />
                    </div>
                </Grid>
                <Grid item xs={12} md={4} lg={3} component="aside">
                    <section>
                        <Typography variant="h5" component="h3" className="mb-4">
                            Recent Posts
                        </Typography>
                        {otherEntries?.map(entry => (
                            <PlantEntryInline  {...entry} />
                        ))}
                    </section>
                    <section className="mt-10">
                        <Typography variant="h5" component="h3" className="mb-4">
                            Categories
                        </Typography>
                        <ul>
                            {categories.map(category => (
                                <li key={category.id}>
                                    <Link href={`/category/${category.slug}`}>
                                        <Typography variant="h6">
                                            {category.title}
                                        </Typography>
                                    </Link>
                                </li>
                            ))}
                        </ul>

                    </section>
                </Grid>
            </Grid>
            <section className="my-4 border-t-2 border-b-2 border-gray-200 pt-12 pb-7">
                <AuthorCard {...plant.author} />
            </section>
        </Layout>
    )
}