import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

class FirebaseClient:
    load_dotenv('.env.local')
    def __init__(self, firebase_config):
        firebase_private_key = os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n')
        firebase_client_email = os.getenv('FIREBASE_CLIENT_EMAIL')
        firebase_project_id = os.getenv('NEXT_PUBLIC_FIREBASE_PROJECT_ID')

        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": firebase_project_id,
            "private_key_id": "dummy-key-id",  # Nếu cần, có thể thêm vào .env
            "private_key": firebase_private_key,
            "client_email": firebase_client_email,
            "client_id": "dummy-client-id",    # Nếu cần, có thể thêm vào .env
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": ""
        })
        firebase_admin.initialize_app(cred)
        self.db = firestore.client()





    def push_outer_job_to_firebase(self, outer_job: dict):
        """
        outer_job: dict chứa các trường theo interface OuterJob
        """
        # Thêm vào collection 'outer_jobs'
        doc_ref = self.db.collection('outer_jobs').document(outer_job['url_hash'])
        doc_ref.set(outer_job)
        print(f"Đã thêm job với url_hash: {outer_job['url_hash']}")