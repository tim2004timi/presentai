pipeline {
    agent any
    
    environment {
        DEPLOY_PATH = '/opt/presentai'
        POSTGRES_DB = 'db'
        POSTGRES_USER = 'trololo'
        POSTGRES_PASSWORD = 'trololo666'
        SECRET_KEY = 'UtNOTJd2e0JzFO0FAmKEiIjQrbGLJSxNiYkgDgVZUMo'
        HOST = '109.172.36.219'
        API_PORT = '8000'
        OPENAI_API_KEY = credentials('openai-api-key')
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
                            # Создаем .env файл из переменных окружения Jenkins
                            cat > .env << 'ENVEOF'
# PostgreSQL
POSTGRES_DB=${POSTGRES_DB}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_PORT=5432

# App
SECRET_KEY=${SECRET_KEY}
ACCESS_TOKEN_EXPIRE_MINUTES=100000
DEBUG=false

# Host
HOST=${HOST}
API_PORT=${API_PORT}

# API
OPENAI_API_KEY=${OPENAI_API_KEY}
ENVEOF
                            
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