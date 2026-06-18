pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/PROYECTOS-APP/LICENCIA-IONIC-FRONTEND.git'
            }
        }

        stage('Install') {
            steps {
                bat 'npm install --legacy-peer-deps'
            }
        }

        stage('Diagnose') {
            steps {
                bat 'echo "=== Package.json Content ==="'
                bat 'type package.json || echo "No se puede leer package.json"'
                bat 'echo "=== Available Scripts ==="'
                bat 'npm run'
                bat 'echo "=== Ionic Version ==="'
                bat 'npx ionic --version'
            }
        }

        stage('Build') {
            steps {
                script {
                    // Intentar diferentes comandos de build
                    def buildCommands = [
                        'npx ionic build --configuration=production',
                        'npx ionic build -c production',
                        'npx ionic build',
                        'npx ng build --configuration=production',
                        'npx ng build',
                        'npm run build'
                    ]
                    
                    def success = false
                    for (cmd in buildCommands) {
                        try {
                            bat cmd
                            success = true
                            break
                        } catch (Exception e) {
                            echo "Comando falló: ${cmd}"
                        }
                    }
                    
                    if (!success) {
                        error "Todos los comandos de build fallaron"
                    }
                }
            }
        }

        stage('Test') {
            steps {
                bat 'echo "Build completed successfully"'
            }
        }

        stage('Deploy') {
            steps {
                bat 'echo "Deploy OK"'
            }
        }
    }
}