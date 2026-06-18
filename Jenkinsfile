pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo ' Clonando repositorio...'
                git branch: 'main', url: 'https://github.com/PROYECTOS-APP/LICENCIA-IONIC-FRONTEND.git'
            }
        }

        stage('Install') {
            steps {
                echo ' Instalando dependencias...'
                bat 'npm install --legacy-peer-deps'
            }
        }

        stage('Build') {
            steps {
                echo ' Construyendo aplicación...'
                // Construir con configuraciones de angular.json
                bat 'npx ng build --configuration=production'
            }
            post {
                success {
                    echo ' Build exitoso'
                    archiveArtifacts artifacts: 'www/**/*'
                }
                failure {
                    echo ' Build falló, intentando con otra configuración...'
                    script {
                        try {
                            // Intentar con configuración de desarrollo
                            bat 'npx ng build --configuration=development'
                            echo ' Build con desarrollo exitoso'
                            archiveArtifacts artifacts: 'www/**/*'
                        } catch (Exception e) {
                            echo ' Build falló completamente'
                            throw e
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo ' Desplegando archivos...'
                bat '''
                    if not exist deploy mkdir deploy
                    xcopy /E /I /Y www deploy
                    echo " Archivos desplegados en deploy/"
                '''
            }
        }
    }

    post {
        success {
            echo ' PIPELINE EXITOSO'
        }
        failure {
            echo ' PIPELINE FALLÓ'
        }
        always {
            cleanWs()
        }
    }
}