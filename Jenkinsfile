pipeline {

    agent any


    environment {

        NEXUS_REGISTRY = "host.docker.internal:8083"

        FRONTEND_IMAGE = "${NEXUS_REGISTRY}/frontend:${BUILD_NUMBER}"

        BACKEND_IMAGE = "${NEXUS_REGISTRY}/backend:${BUILD_NUMBER}"

        NETWORK = "devops-network"

        NGINX_CONFIG = "nginx/nginx.conf"

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

                    def nginx = readFile("${NGINX_CONFIG}")


                    if (nginx.contains("server frontend-blue:80;")) {

                        env.ACTIVE_COLOR = "BLUE"
                        env.TARGET_COLOR = "GREEN"

                    } else {

                        env.ACTIVE_COLOR = "GREEN"
                        env.TARGET_COLOR = "BLUE"

                    }


                    echo "Active color: ${env.ACTIVE_COLOR}"
                    echo "Deploying new version to: ${env.TARGET_COLOR}"

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



        stage('Deploy New Color') {

            steps {


                sh """

                echo "Deploying ${TARGET_COLOR}"


                docker pull ${FRONTEND_IMAGE}

                docker pull ${BACKEND_IMAGE}



                if [ "${TARGET_COLOR}" = "GREEN" ]; then


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



        stage('Health Check') {

            steps {


                sh """

                echo "Checking ${TARGET_COLOR} health"

                sleep 10



                if [ "${TARGET_COLOR}" = "GREEN" ]; then

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



        stage('Switch Nginx Traffic') {

            steps {


                sh """

                echo "Switching traffic to ${TARGET_COLOR}"


                python3 <<EOF

from pathlib import Path


path = Path("${NGINX_CONFIG}")

content = path.read_text()



if "${TARGET_COLOR}" == "GREEN":

    content = content.replace(
        "server frontend-blue:80;",
        "#server frontend-blue:80;"
    )

    content = content.replace(
        "#server frontend-green:80;",
        "server frontend-green:80;"
    )

    content = content.replace(
        "server backend-blue:3002;",
        "#server backend-blue:3002;"
    )

    content = content.replace(
        "#server backend-green:3002;",
        "server backend-green:3002;"
    )


else:

    content = content.replace(
        "#server frontend-blue:80;",
        "server frontend-blue:80;"
    )

    content = content.replace(
        "server frontend-green:80;",
        "#server frontend-green:80;"
    )

    content = content.replace(
        "#server backend-blue:3002;",
        "server backend-blue:3002;"
    )

    content = content.replace(
        "server backend-green:3002;",
        "#server backend-green:3002;"
    )


path.write_text(content)

EOF



                docker exec reverse-proxy nginx -s reload


                """

            }

        }



        stage('Cleanup') {

            steps {


                sh """

                docker image prune -f

                """

            }

        }


    }


}