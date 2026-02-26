pipeline {
    agent {
        docker { image 'node:20' }  // Node.js official image
    }

    environment {
        GITEA_CREDENTIALS = 'gitea-credentials'
        NEXUS_CREDENTIALS = 'nexus-credentials'
        ARTIFACT_VERSION = "${env.BUILD_NUMBER}"
        DOCKER_IMAGE_NAME = "my-app:${ARTIFACT_VERSION}"
        NEXUS_REPO_URL = "nexus.company.com/repository/docker-hosted/"
        MONGO_URI = "mongodb://mongo:27017/myapp"  // set your DB URI
    }

    stages {
        stage('Build Frontend & Backend') {
            steps {
                dir('frontend') { sh 'npm install && npm run build' }
                dir('backend') { sh 'npm install && npm run build' }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE_NAME} ."
            }
        }

        stage('Push to Nexus') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${NEXUS_CREDENTIALS}", usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                    sh """
                        echo $NEXUS_PASS | docker login ${NEXUS_REPO_URL} -u $NEXUS_USER --password-stdin
                        docker tag ${DOCKER_IMAGE_NAME} ${NEXUS_REPO_URL}${DOCKER_IMAGE_NAME}
                        docker push ${NEXUS_REPO_URL}${DOCKER_IMAGE_NAME}
                    """
                }
            }
        }
    }
}