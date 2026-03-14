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

         stage('Blue-Green Deploy') {
            steps {
                sh '''
                ACTIVE=$(cat /var/jenkins_home/active_env)

if [ "$ACTIVE" = "blue" ]; then
  TARGET=green
else
  TARGET=blue
fi

docker pull host.docker.internal:8083/my-app:$BUILD_NUMBER

docker stop ${TARGET}-app || true
docker rm ${TARGET}-app || true

docker run -d \
  --name ${TARGET}-app \
  --network devops-network \
  host.docker.internal:8083/my-app:$BUILD_NUMBER

sleep 10

sed -i "s/${ACTIVE}-app:3002/${TARGET}-app:3002/g" /nginx/nginx.conf
docker exec reverse-proxy nginx -s reload

echo $TARGET > /var/jenkins_home/active_env
                '''
            }
        }
        
        stage('Cleanup Docker') {
            steps {
               sh 'docker system prune -f'
    }
}

    }
}