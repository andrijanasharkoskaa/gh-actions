// pipeline {
//     agent any

//     environment {
//         GITEA_CREDENTIALS = 'gitea-credentials'
//         NEXUS_CREDENTIALS = 'nexus-credentials'
//         ARTIFACT_VERSION = "${env.BUILD_NUMBER}"
//         DOCKER_IMAGE_NAME = "my-app:${ARTIFACT_VERSION}"
//         NEXUS_REPO_URL = "http://host.docker.internal:8083"
//     }

//     stages {
//         stage('Build Frontend & Backend') {
//             agent { docker { image 'node:20' } } // builds inside Node container
//             steps {
//                 dir('frontend') { sh 'npm install && npm run build' }
//                 dir('backend') { sh 'npm install && npm run build' }
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 sh """
//                   docker build -t ${DOCKER_IMAGE_NAME} .
//                 """
//             }
//         }

//         stage('Push to Nexus') {
//     steps {
//         withCredentials([usernamePassword(
//             credentialsId: "${NEXUS_CREDENTIALS}", 
//             usernameVariable: 'NEXUS_USER', 
//             passwordVariable: 'NEXUS_PASS'
//         )]) {
//             sh """
//                 # Login to Nexus Docker registry
//                 echo \$NEXUS_PASS | docker login ${NEXUS_REPO_URL} -u \$NEXUS_USER --password-stdin

//                 # Tag the Docker image correctly
//                 docker tag ${DOCKER_IMAGE_NAME} ${NEXUS_REPO_URL}/${DOCKER_IMAGE_NAME}

//                 # Push the image
//                 docker push ${NEXUS_REPO_URL}/${DOCKER_IMAGE_NAME}
//             """
//         }
//     }
// }
//     }
// }

pipeline {
    agent any

    environment {
        GITEA_CREDENTIALS = 'gitea-credentials'
        NEXUS_CREDENTIALS = 'nexus-credentials'
        ARTIFACT_VERSION = "${env.BUILD_NUMBER}"
        DOCKER_IMAGE_NAME = "my-app:${ARTIFACT_VERSION}"
        NEXUS_REPO_URL = "http://host.docker.internal:8083"
        NEXUS_REGISTRY_HOST = "host.docker.internal"
        NEXUS_REGISTRY_PORT = "8083"
    }

    stages {

        stage('Build Frontend & Backend') {
            agent { docker { image 'node:20' } }
            steps {
                dir('frontend') { sh 'npm install && npm run build' }
                dir('backend') { sh 'npm install && npm run build' }
            }
        }

        // 👇 ADD THE NEW STAGE HERE
        stage('Deploy to Blue/Green Folder') {
            steps {
                script {
                    def activeEnv = sh(script: "cat devops-infra/active_env || echo blue", returnStdout: true).trim()

                    if (activeEnv == "blue") {
                        sh """
                        rm -rf devops-infra/green/*
                        cp -r frontend/build/* devops-infra/green/
                        """
                        env.TARGET_ENV = "green"
                    } else {
                        sh """
                        rm -rf devops-infra/blue/*
                        cp -r frontend/build/* devops-infra/blue/
                        """
                        env.TARGET_ENV = "blue"
                    }
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

        stage('Push to Nexus') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${NEXUS_CREDENTIALS}",
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

    }
}




