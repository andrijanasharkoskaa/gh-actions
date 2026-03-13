pipeline {
    agent any

    environment {
        ARTIFACT_VERSION = "${env.BUILD_NUMBER}"
        DOCKER_IMAGE_NAME = "my-app:${ARTIFACT_VERSION}"
        NEXUS_REGISTRY_HOST = "host.docker.internal"
        NEXUS_REGISTRY_PORT = "8083"
    }

    stages {

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE_NAME} ."
            }
        }

        stage('Push to Nexus') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "nexus-credentials",
                    usernameVariable: 'NEXUS_USER',
                    passwordVariable: 'NEXUS_PASS'
                )]) {
                    sh """
                        echo \$NEXUS_PASS | docker login ${NEXUS_REGISTRY_HOST}:${NEXUS_REGISTRY_PORT} -u \$NEXUS_USER --password-stdin
                        docker tag ${DOCKER_IMAGE_NAME} ${NEXUS_REGISTRY_HOST}:${NEXUS_REGISTRY_PORT}/${DOCKER_IMAGE_NAME}
                        docker push ${NEXUS_REGISTRY_HOST}:${NEXUS_REGISTRY_PORT}/${DOCKER_IMAGE_NAME}
                    """
                }
            }
        }
        stage('Cleanup Docker') {
            steps {
               sh 'docker system prune -f'
    }
}

    }
}