pipeline {
    agent any
    
    environment {
        DEPLOY_PATH = '/opt/presentai'
    }
    
    stages {
        stage('Setup Docker Compose') {
            steps {
                script {
                    sh '''
                        # Устанавливаем docker-compose если его нет
                        if ! command -v docker-compose &> /dev/null; then
                            echo "Installing docker-compose..."
                            apt-get update
                            apt-get install -y curl
                            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                            chmod +x /usr/local/bin/docker-compose
                            ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
                        fi
                    '''
                }
            }
        }
        
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
                            # Используем docker-compose
                            docker-compose down || true
                            docker-compose build --no-cache
                            docker-compose up -d
                            sleep 10
                            docker-compose ps
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