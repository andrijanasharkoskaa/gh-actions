pipeline {

    agent any


    environment {


        NEXUS_REGISTRY =
        "host.docker.internal:8083"


        FRONTEND_IMAGE =
        "${NEXUS_REGISTRY}/frontend:${BUILD_NUMBER}"


        BACKEND_IMAGE =
        "${NEXUS_REGISTRY}/backend:${BUILD_NUMBER}"


        NETWORK =
        "devops-network"


    }



    stages {



        stage('Checkout') {

            steps {

                echo "Source code checked out from Gitea"

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





        stage('Deploy GREEN') {


            steps {


                sh """


                echo "Deploying build ${BUILD_NUMBER} as GREEN"



                docker stop frontend-green || true
                docker rm frontend-green || true



                docker stop backend-green || true
                docker rm backend-green || true




                docker pull ${FRONTEND_IMAGE}


                docker pull ${BACKEND_IMAGE}





                docker run -d \\

                --name frontend-green \\

                --network ${NETWORK} \\

                ${FRONTEND_IMAGE}





                docker run -d \\

                --name backend-green \\

                --network ${NETWORK} \\

                -e INSTANCE_NAME=GREEN \\

                -e MONGO_URL=mongodb://mongo:27017/testdb \\

                ${BACKEND_IMAGE}





                """

            }

        }





        stage('Health Check GREEN') {


            steps {


                sh """


                echo "Waiting for GREEN"



                sleep 10




                docker exec reverse-proxy \
                wget -qO- \
                http://backend-green:3002/health



                """

            }

        }





        stage('Switch Nginx To GREEN') {


            steps {


                sh """


                sed -i \
                's/frontend-blue/frontend-green/g' \
                /nginx/nginx.conf




                sed -i \
                's/backend-blue/backend-green/g' \
                /nginx/nginx.conf





                docker exec reverse-proxy \
                nginx -s reload



                """

            }

        }





        stage('Cleanup Old Docker Images') {


            steps {


                sh """


                docker image prune -f


                """

            }

        }



    }


}