pipeline {
    agent any
    
    environment {
        DEPLOY_PATH = '/opt/presentai'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    extensions: [],
                    userRemoteConfigs: scm.userRemoteConfigs
                ])
            }
        }
        stage('Tests') {
            steps {
                dir('backend') {
                    sh '''
                        python3 -m venv venv || true
                        . venv/bin/activate
                        pip install --upgrade pip --quiet
                        pip install -r requirements.txt --quiet
                        pytest -v
                    '''
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    // Копируем файлы в рабочую директорию (локально на сервере)
                    sh """
                        mkdir -p ${DEPLOY_PATH}
                        cp -r docker-compose.yml ${DEPLOY_PATH}/
                        cp -r backend ${DEPLOY_PATH}/
                        cp -r frontend ${DEPLOY_PATH}/
                        [ -d monitoring ] && cp -r monitoring ${DEPLOY_PATH}/ || true
                    """
                    
                    // Деплой через docker-compose (локально)
                    dir("${DEPLOY_PATH}") {
                        sh """
                            docker-compose down || true
                            docker-compose build --no-cache
                            docker-compose up -d
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

