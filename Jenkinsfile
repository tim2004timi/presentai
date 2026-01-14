pipeline {
    agent any
    
    environment {
        DEPLOY_PATH = '/opt/presentai'
    }
    
    stages {
        stage('Deploy') {
            steps {
                script {
                    sh """
                        mkdir -p ${DEPLOY_PATH}
                        cp -r docker-compose.yml ${DEPLOY_PATH}/
                        cp -r backend ${DEPLOY_PATH}/
                        cp -r frontend ${DEPLOY_PATH}/
                        [ -d monitoring ] && cp -r monitoring ${DEPLOY_PATH}/ || true
                    """
                    
                    dir("${DEPLOY_PATH}") {
                        sh """
                            if docker compose version &> /dev/null 2>&1; then
                                DOCKER_COMPOSE_CMD="docker compose"
                            elif command -v docker-compose &> /dev/null; then
                                DOCKER_COMPOSE_CMD="docker-compose"
                            else
                                echo "Error: docker compose not found"
                                exit 1
                            fi
                            
                            \$DOCKER_COMPOSE_CMD down || true
                            \$DOCKER_COMPOSE_CMD build --no-cache
                            \$DOCKER_COMPOSE_CMD up -d
                            sleep 5
                            \$DOCKER_COMPOSE_CMD ps
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}

