import {PROD_API_URL, DEV_API_URL} from "@env"

const devEnvVariables = {
    API_URL: DEV_API_URL
}

const prodEnvVariables = {
    API_URL: PROD_API_URL
}


export default __DEV__ ? devEnvVariables : prodEnvVariables