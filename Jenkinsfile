pipeline {
    agent any
    
    environment {
        DEPLOY_PATH = '/opt/presentai'
        POSTGRES_DB = 'db'
        POSTGRES_USER = 'trololo'
        POSTGRES_PASSWORD = 'trololo666'
        SECRET_KEY = 'UtNOTJd2e0JzFO0FAmKEiIjQrbGLJSxNiYkgDgVZUMo'
        HOST = '109.172.36.219'
        API_PORT = '8001'
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
                        if [ -d monitoring ]; then
                            cp -r monitoring ${DEPLOY_PATH}/
                            echo "Monitoring directory copied successfully"
                            ls -la ${DEPLOY_PATH}/monitoring/grafana/dashboards/ || echo "Dashboards directory not found"
                        else
                            echo "Warning: monitoring directory not found in workspace"
                        fi
                    """
                    
                    dir("${DEPLOY_PATH}") {
                        sh """
                            # Создаем .env файл если его нет (используем существующий или создаем новый)
                            if [ ! -f .env ]; then
                                cat > .env << ENVEOF
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
# OPENAI_API_KEY должен быть установлен вручную на сервере в файле .env
OPENAI_API_KEY=
ENVEOF
                            fi
                            
                            # Проверяем, что дашборды скопировались
                            if [ -f monitoring/grafana/dashboards/16110_rev4.json ]; then
                                echo "Dashboard file found: monitoring/grafana/dashboards/16110_rev4.json"
                                ls -lh monitoring/grafana/dashboards/
                            else
                                echo "Warning: Dashboard file not found!"
                                find . -name "16110_rev4.json" 2>/dev/null || echo "File not found anywhere"
                            fi
                            
                            # Используем docker-compose
                            docker-compose down || true
                            docker-compose build --no-cache
                            docker-compose up -d
                            sleep 15
                            
                            # Проверяем, что дашборды доступны в контейнере Grafana
                            echo "Checking dashboards in Grafana container:"
                            docker exec grafana-presentai ls -la /var/lib/grafana/dashboards/ || echo "Cannot access Grafana container"
                            
                            # Перезапускаем Grafana чтобы она перечитала дашборды
                            docker-compose restart grafana
                            sleep 5
                            
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