
import * as validator from 'validator'
import { FunctionEvent } from 'graphcool-lib'

interface EventData{
    id: string
    username: string
    email: string
}

export default async (event: FunctionEvent<EventData>) => {

    event.data.email = event.data.email.toLowerCase()

    if(!validator.isEmail(event.data.email)){
        return {
            error: `${event.data.email} is not a valid email!`
        }
    }
    return {data: event.data}
}