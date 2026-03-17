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
        # Determine active server from nginx.conf
        ACTIVE=$(grep 'server ' /nginx/nginx.conf | grep -v '#' | awk '{print $2}' | cut -d ':' -f1 | tr -d ';')

        if [ "$ACTIVE" = "blue-app" ]; then
            TARGET=green
        else
            TARGET=blue
        fi

        echo "Active: $ACTIVE, Deploying: $TARGET"

        # Pull and run target container
        docker pull host.docker.internal:8083/my-app:$BUILD_NUMBER

        docker stop ${TARGET}-app || true
        docker rm ${TARGET}-app || true

        docker run -d \
          --name ${TARGET}-app \
          --network devops-network \
          host.docker.internal:8083/my-app:$BUILD_NUMBER

        sleep 10

        # Comment old server, uncomment new server in nginx.conf
        sed -i "s|#server ${TARGET}-app:3002;.*|server ${TARGET}-app:3002;|" /nginx/nginx.conf
        sed -i "s|server ${ACTIVE}-app:3002;.*|#server ${ACTIVE}-app:3002;|" /nginx/nginx.conf   

        docker exec reverse-proxy nginx -s reload
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