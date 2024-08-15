import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono'
import { use } from 'hono/jsx'
import { sign } from 'hono/jwt'

const app = new Hono<{
  Bindings:{
    DATABASE_URL:string,
    JWT_SECRET:string
  }
}>()


app.route("/api/v1/user",userRoute)
app.route("/api/v1/blog",blogRoute)
app.get('/',(c)=>{
  
  return c.text("Hello World")
})

app.post('/api/v1/user/sigup',async (c) => {
  const body = await c.req.json()
  const prisma = new PrismaClient({datasourceUrl:c.env.DATABASE_URL}).$extends(withAccelerate())
  //not added zod,password not hashed

  try {
    const user = await prisma.user.create({
      data:{
        userName:body.userName,
        password:body.password,
        name: body.name
      }
    })  
    const jwt = await sign({
      id:user.id
    },c.env.JWT_SECRET)
    return c.text(jwt)
  } catch (error) {
    c.status(411)
    return c.text(`Invalid:${error}`)
  }
  
})

app.post('/api/v1/user/sigin',async (c) => {
  const body = await c.req.json()
  const prisma = new PrismaClient({datasourceUrl:c.env.DATABASE_URL}).$extends(withAccelerate())
  //not added zod,password not hashed

  try {
    const user = await prisma.user.findFirst({
      where:{
        userName:body.userName,
        password:body.password,
        }
    })  
    if(!user){
      c.status(403)
      return c.json({
        message:"user doesn't exist"
      })
    }
    const jwt = await sign({
      id:user.id
    },c.env.JWT_SECRET)
    return c.text(jwt)
  } catch (error) {
    c.status(411)
    return c.text(`Invalid:${error}`)
  }
  
})

export default app
