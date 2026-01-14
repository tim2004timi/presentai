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

