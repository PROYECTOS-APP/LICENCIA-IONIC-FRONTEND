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
                bat 'npm install'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Test') {
            steps {
                bat 'echo test OK'
            }
        }

        stage('Deploy') {
            steps {
                bat 'echo deploy OK'
            }
        }
    }
}