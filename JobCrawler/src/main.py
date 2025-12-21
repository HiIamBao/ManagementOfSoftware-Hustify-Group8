
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os

# Khởi tạo Firebase app từ biến môi trường trong file .env.local
def init_firebase():
    load_dotenv('.env.local')
    if not firebase_admin._apps:
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

def push_outer_job_to_firebase(outer_job: dict):
    """
    outer_job: dict chứa các trường theo interface OuterJob
    """
    db = firestore.client()
    # Thêm vào collection 'outer_jobs'
    doc_ref = db.collection('outer_jobs').document(outer_job['url_hash'])
    doc_ref.set(outer_job)
    print(f"Đã thêm job với url_hash: {outer_job['url_hash']}")

# Ví dụ sử dụng:
print("Đang khởi tạo Firebase...")
init_firebase()


data = {"url_hash": "b5de35fb45e81e2715ce9332f0e18df4141faf5c121c2ff29997ca7da725913f", "job_url": "https://www.topcv.vn/viec-lam/tech-lead-backend-developer-java/1553440.html", "title": "Tech Lead Backend Developer (Java)", "datetime": "2025-12-14T15:58:45.021758", "detail_title": "Tech Lead Backend Developer ( Java )", "detail_salary": "Thoả thuận", "detail_location": "Hà Nội", "detail_experience": "5 năm", "deadline": "10/01/2026", "tags": "5 năm kinh nghiệm; Đại Học trở lên; Backend Developer", "desc_mota": "Phối hợp, hỗ trợ cùng với Technical Lead trong việc tiếp nhận đầu bài từ Business Analyst/ Business Solution nhằm đánh giá, phân tích tính khả thi việc triển khai sản phẩm Phối hợp, tham gia cùng với Technical Lead trong việc thiết kế giải pháp phần mềm, giải pháp tích hợp API, Module/Layer, Data storage Phát triển các sản phẩm phần mềm theo giải pháp, công nghệ do Technical Lead đưa ra (Nghiệp vụ phức tạp nhất; Độ khó sản phẩm cao nhất; Phạm vi ảnh hưởng và độ rủi ro cao nhất) Triển khai các giải pháp bảo mật theo quy định Đánh giá yêu cầu xây dựng (đánh giá được hết tất cả các trường hợp, hiểu bản chất của vấn đề), sửa đổi tính năng Xử lý lỗi phát sinh trong quá trình vận hành Tổ chức chia sẻ/đào tạo chuyên môn nghiệp vụ/ Biz Domain trong mảng công việc phụ trách Tìm kiếm các phương án tối ưu nhằm nâng cao giải pháp, hiệu suất cho quá trình phát triển sản phẩm Nghiên cứu, cập nhật các xu hướng, công nghệ liên quan đến phát triển sản phẩm", "desc_yeucau": "1. Kinh nghiệm làm việc Có tối thiểu từ 5 năm kinh nghiệm phát triển backend sử dụng ngôn ngữ Java. Có kinh nghiệm làm việc với các hệ quản trị dữ liệu quan hệ như MySQL/PostgreSQL và Search Engine như Solr/ElasticSearch... Có kinh nghiệm viết Unit test, Integration test. Ưu tiên có kinh nghiệm: Spring Cloud, Spring Security, Redis, Kafka, CICD ... Có kinh nghiệm triển khai, phát triển phần mềm bằng Agile/ Scrum. 2. Kiến thức/Năng lực chuyên môn/Kỹ năng Có khả năng phân tích, sắp xếp và triển khai công việc theo thứ tự ưu tiên. Có kỹ năng giao tiếp và làm việc nhóm tốt. Có đam mê và định hướng lâu dài với nghề lập trình Cần phải có hiểu biết về khoa học máy tính Cần phải có hiểu biết vững chắc về các nguyên tắc cơ bản của JDK 8+, Spring boot 2.x+, Spring framework 5+. Yêu cầu kiến thức và kỹ năng: API RESTful, Microservice architecture, Distributed transaction, Code management (GitHub/JIRA....) Kiến thức về các ngôn ngữ lập trình: Đây là nền tảng cơ bản của lập trình. Một lập trình viên cần biết ít nhất một ngôn ngữ lập trình để có thể viết mã. Kiến thức về các cấu trúc dữ liệu và thuật toán: Đây là những kiến thức cần thiết để viết mã hiệu quả và hiệu suất. Kiến thức về các framework và thư viện: Các framework và thư viện cung cấp các tính năng và chức năng sẵn có, giúp lập trình viên tiết kiệm thời gian và công sức. Kiến thức về cơ sở dữ liệu: Cơ sở dữ liệu lưu trữ dữ liệu của một ứng dụng hoặc trang web. Lập trình viên cần có kiến thức về cách truy cập và quản lý dữ liệu trong cơ sở dữ liệu. Kiến thức về kiến trúc web: Kiến trúc web là cách thức các trang web và ứng dụng được thiết kế và xây dựng. Lập trình viên cần có kiến thức về cách thiết kế và xây dựng các trang web và ứng dụng có thể mở rộng và bảo mật. Kiến thức về bảo mật: Bảo mật là một vấn đề quan trọng đối với các ứng dụng và trang web. Lập trình viên cần có kiến thức về cách bảo vệ các ứng dụng và trang web khỏi các cuộc tấn công bảo mật. 3. Năng lực cốt lõi Có tố chất và tư duy phù hợp với hệ giá trị cốt lõi của công ty (IPAM & 4C)", "desc_quyenloi": "1. Cộng đồng những người làm nghề chính trực và dấn thân phụng sự Môi trường làm nghề tài chính chuyên nghiệp. Làm việc với tinh thần làm chủ, sáng tạo và thách thức. 2. Tổng thu nhập theo năng lực Thu nhập xứng đáng theo năng lực và giá trị đóng góp. Xem xét thay đổi thu nhập hàng năm. 3. Chế độ đãi ngộ Tham gia BHXH, BHYT, BHTN theo đúng quy định luật lao động. Được tham gia đóng bảo hiểm sức khỏe và bảo hiểm tai nạn 24/24. 4. Tổ chức học tập và văn hóa sôi nổi Không gian làm việc mở với trang thiết bị hiện đại. Các hoạt động văn hóa, gắn kết đội ngũ, thiện nguyện phong phú, ý nghĩa.", "working_addresses": "- Hà Nội: Phường Thanh Xuân", "working_times": None, "company_url_from_job": "https://www.topcv.vn/cong-ty/fecredit/81412.html?ta_source=IntroModal#section-live-stream", "general_info": "a,b,c", "box_categories": "Công nghệ thông tin/Phần mềm; Lập trình viên"}


# push_outer_job_to_firebase({
#     "url_hash": "Day la job dau tien",
#     "job_url": "Dau la job url",
#     "datetime": "...",
#     "detail_title": "Day la tieu de cong viec",
#     "detail_salary": "...",
#     "detail_location": "...",
#     "detail_experience": "...",
#     "deadline": "...",
#     "tags": "...",
#     "desc_mota": "...",
#     "desc_yeucau": "...",
#     "desc_quyenloi": "...",
#     "working_addresses": "...",
#     "working_times": "...",
#     "company_url_from_job": "...",
#     "general_info": "...",
#     "box_categories": "..."
# })


push_outer_job_to_firebase(data)




