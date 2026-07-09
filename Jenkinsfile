pipeline {

    agent any


    environment {

        NEXUS_REGISTRY = "host.docker.internal:8083"

        FRONTEND_IMAGE =
        "${NEXUS_REGISTRY}/frontend:${BUILD_NUMBER}"

        BACKEND_IMAGE =
        "${NEXUS_REGISTRY}/backend:${BUILD_NUMBER}"

        NETWORK = "devops-network"

    }


    stages {


        stage('Checkout') {

            steps {

                echo "Using source from Gitea"

            }

        }




        stage('Detect Active Color') {

            steps {

                script {


                    def nginxConfig = readFile('nginx/nginx.conf')


                    if (nginxConfig.contains('frontend-blue')) {


                        env.ACTIVE_COLOR = "BLUE"
                        env.DEPLOY_COLOR = "GREEN"


                    } else {


                        env.ACTIVE_COLOR = "GREEN"
                        env.DEPLOY_COLOR = "BLUE"


                    }


                    echo "Active color: ${env.ACTIVE_COLOR}"
                    echo "Deploying new version to: ${env.DEPLOY_COLOR}"


                }

            }

        }





        stage('Build Frontend Image') {


            steps {


                sh """

                docker build \
                -t frontend:${BUILD_NUMBER} \
                ./frontend



                docker tag \
                frontend:${BUILD_NUMBER} \
                ${FRONTEND_IMAGE}


                """

            }

        }





        stage('Build Backend Image') {


            steps {


                sh """

                docker build \
                -t backend:${BUILD_NUMBER} \
                ./backend



                docker tag \
                backend:${BUILD_NUMBER} \
                ${BACKEND_IMAGE}


                """

            }

        }





        stage('Login To Nexus') {


            steps {


                withCredentials([

                    usernamePassword(

                        credentialsId: 'nexus-credentials',

                        usernameVariable: 'NEXUS_USER',

                        passwordVariable: 'NEXUS_PASSWORD'

                    )

                ]) {


                    sh """

                    echo \$NEXUS_PASSWORD | docker login \
                    ${NEXUS_REGISTRY} \
                    -u \$NEXUS_USER \
                    --password-stdin


                    """

                }


            }

        }





        stage('Push Images To Nexus') {


            steps {


                sh """


                docker push ${FRONTEND_IMAGE}


                docker push ${BACKEND_IMAGE}


                """


            }

        }





        stage('Deploy Inactive Environment') {


            steps {


                sh """


                echo "Deploying ${DEPLOY_COLOR}"



                docker pull ${FRONTEND_IMAGE}

                docker pull ${BACKEND_IMAGE}



                if [ "${DEPLOY_COLOR}" = "GREEN" ]

                then


                    docker stop frontend-green || true
                    docker rm frontend-green || true


                    docker stop backend-green || true
                    docker rm backend-green || true



                    docker run -d \
                    --name frontend-green \
                    --network ${NETWORK} \
                    ${FRONTEND_IMAGE}



                    docker run -d \
                    --name backend-green \
                    --network ${NETWORK} \
                    -e INSTANCE_NAME=GREEN \
                    -e MONGO_URL=mongodb://mongo:27017/testdb \
                    ${BACKEND_IMAGE}



                else



                    docker stop frontend-blue || true
                    docker rm frontend-blue || true


                    docker stop backend-blue || true
                    docker rm backend-blue || true



                    docker run -d \
                    --name frontend-blue \
                    --network ${NETWORK} \
                    ${FRONTEND_IMAGE}



                    docker run -d \
                    --name backend-blue \
                    --network ${NETWORK} \
                    -e INSTANCE_NAME=BLUE \
                    -e MONGO_URL=mongodb://mongo:27017/testdb \
                    ${BACKEND_IMAGE}



                fi



                """

            }

        }





        stage('Health Check New Version') {


            steps {


                sh """


                echo "Checking ${DEPLOY_COLOR} health"



                sleep 10



                if [ "${DEPLOY_COLOR}" = "GREEN" ]

                then


                    docker exec reverse-proxy \
                    wget -qO- \
                    http://backend-green:3002/health



                else


                    docker exec reverse-proxy \
                    wget -qO- \
                    http://backend-blue:3002/health



                fi



                """

            }

        }





        stage('Ready For Manual Traffic Switch') {


            steps {


                echo """

                =========================================

                Deployment successful!

                Active environment:
                ${ACTIVE_COLOR}


                New environment:
                ${DEPLOY_COLOR}


                To switch traffic:

                1. Edit nginx/nginx.conf

                2. Change upstream servers from:
                   ${ACTIVE_COLOR}

                   to:

                   ${DEPLOY_COLOR}


                3. Reload nginx:

                   docker exec reverse-proxy nginx -s reload


                =========================================

                """

            }

        }





        stage('Cleanup Docker Cache') {


            steps {


                sh """

                docker image prune -f


                """

            }

        }



    }


}