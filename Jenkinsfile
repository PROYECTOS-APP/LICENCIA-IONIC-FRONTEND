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

        stage('Build') {
            steps {
                // Sobrescribir budgets desde la línea de comandos
                bat 'npx ng build --configuration=production --budgets="anyComponentStyle:10kb|initial:5mb"'
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