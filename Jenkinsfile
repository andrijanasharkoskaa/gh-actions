pipeline {

    agent any


    environment {

        NEXUS_REGISTRY = "host.docker.internal:8083"

        FRONTEND_IMAGE =
        "${NEXUS_REGISTRY}/frontend:${BUILD_NUMBER}"

        BACKEND_IMAGE =
        "${NEXUS_REGISTRY}/backend:${BUILD_NUMBER}"

    }



    stages {


        stage('Checkout') {

            steps {

                echo "Using source from Gitea"

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

                echo "Pushing images to Nexus"

                docker push ${FRONTEND_IMAGE}

                docker push ${BACKEND_IMAGE}


                """

            }

        }





        stage('Cleanup Docker Cache') {

            steps {


                sh """

                echo "Cleaning unused Docker images"

                docker image prune -f


                """

            }

        }



    }



    post {


        success {

            echo """

            =====================================

            BUILD SUCCESSFUL

            Frontend image:

            ${FRONTEND_IMAGE}


            Backend image:

            ${BACKEND_IMAGE}


            Images are available in Nexus.

            Deploy manually to Blue or Green environment.

            =====================================

            """

        }



        failure {

            echo "Build failed"

        }


    }



}