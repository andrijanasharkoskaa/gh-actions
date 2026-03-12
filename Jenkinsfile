pipeline {
    agent any

    environment {
        NEXUS_CREDENTIALS = 'nexus-credentials'
        ARTIFACT_VERSION = "${env.BUILD_NUMBER}"
        DOCKER_IMAGE_NAME = "my-app:${ARTIFACT_VERSION}"
        NEXUS_REGISTRY = "host.docker.internal:8083"
    }

    stages {

        stage('Build Frontend & Backend') {
            agent any

            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }

                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                docker build -t ${DOCKER_IMAGE_NAME} .
                """
            }
        }

        stage('Push Image to Nexus') {

            steps {

                withCredentials([usernamePassword(
                    credentialsId: "${NEXUS_CREDENTIALS}",
                    usernameVariable: 'NEXUS_USER',
                    passwordVariable: 'NEXUS_PASS'
                )]) {

                    sh """
                    echo \$NEXUS_PASS | docker login ${NEXUS_REGISTRY} -u \$NEXUS_USER --password-stdin
                    docker tag ${DOCKER_IMAGE_NAME} ${NEXUS_REGISTRY}/${DOCKER_IMAGE_NAME}
                    docker push ${NEXUS_REGISTRY}/${DOCKER_IMAGE_NAME}
                    """
                }

            }
        }

        stage('Deploy to Inactive Environment') {

            steps {

                script {

                    def activeEnv = sh(
                        script: "cat devops-infra/active_env",
                        returnStdout: true
                    ).trim()

                    if (activeEnv == "blue") {
                        env.TARGET_ENV = "green"
                    } else {
                        env.TARGET_ENV = "blue"
                    }

                    sh """
                    docker pull ${NEXUS_REGISTRY}/${DOCKER_IMAGE_NAME}

                    docker stop ${env.TARGET_ENV}-app || true
                    docker rm ${env.TARGET_ENV}-app || true

                    docker run -d \
                    --name ${env.TARGET_ENV}-app \
                    --network devops-network \
                    ${NEXUS_REGISTRY}/${DOCKER_IMAGE_NAME}
                    """
                }
            }
        }

        stage('Switch Nginx Traffic') {

            steps {

                script {

                    def activeEnv = sh(
                        script: "cat devops-infra/active_env",
                        returnStdout: true
                    ).trim()

                    if (activeEnv == "blue") {

                        sh """
                        sed -i 's/server blue-app/# server blue-app/' nginx/nginx.conf
                        sed -i 's/# server green-app/server green-app/' nginx/nginx.conf
                        """

                        sh "echo green > devops-infra/active_env"

                    } else {

                        sh """
                        sed -i 's/server green-app/# server green-app/' nginx/nginx.conf
                        sed -i 's/# server blue-app/server blue-app/' nginx/nginx.conf
                        """

                        sh "echo blue > devops-infra/active_env"
                    }

                    sh "docker exec reverse-proxy nginx -s reload"
                }
            }
        }
    }
}