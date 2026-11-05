// ===================== CÂU 7: FORM VALIDATION NỘI TUYẾN + GỬI API THANH TOÁN (GIẢ LẬP) =====================

// Regex tự định nghĩa
// SĐT Việt Nam: bắt đầu 0 hoặc +84, tiếp theo đầu số di động 3/5/7/8/9, rồi đúng 8 chữ số
var REGEX_SDT = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
// Email: phần tên @ tên miền . đuôi (ít nhất 2 ký tự)
var REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Mỗi ô: id input, id chỗ báo lỗi, hàm kiểm tra trả về "" nếu hợp lệ hoặc câu báo lỗi
var QUY_TAC = [
  { o: "ttHoTen", loi: "loiHoTen", kiemTra: function (v) { return v.trim().length >= 3 ? "" : "Họ tên tối thiểu 3 ký tự"; } },
  { o: "ttSdt", loi: "loiSdt", kiemTra: function (v) { return REGEX_SDT.test(v.trim()) ? "" : "SĐT không hợp lệ (VD: 0912345678 hoặc +84912345678)"; } },
  { o: "ttEmail", loi: "loiEmail", kiemTra: function (v) { return REGEX_EMAIL.test(v.trim()) ? "" : "Email không đúng định dạng"; } },
  { o: "ttDiaChi", loi: "loiDiaChi", kiemTra: function (v) { return v.trim().length >= 5 ? "" : "Vui lòng nhập địa chỉ"; } }
];

function kiemTraO(quyTac) {
  var input = document.getElementById(quyTac.o);
  var thongBao = quyTac.kiemTra(input.value);
  document.getElementById(quyTac.loi).innerHTML = thongBao;
  if (thongBao == "") {
    input.classList.remove("sai"); input.classList.add("dung");
    return true;
  }
  input.classList.remove("dung"); input.classList.add("sai");
  return false;
}

// Gắn sự kiện keyup + blur cho từng ô → kiểm tra NGAY LẬP TỨC
function ganKiemTraNoiTuyen() {
  for (var i = 0; i < QUY_TAC.length; i++) {
    (function (qt) {
      var input = document.getElementById(qt.o);
      input.onkeyup = function () { kiemTraO(qt); };
      input.onblur = function () { kiemTraO(qt); };
    })(QUY_TAC[i]);
  }

  document.getElementById("formThanhToan").onsubmit = function (e) {
    e.preventDefault();
    var hopLe = true;
    for (var i = 0; i < QUY_TAC.length; i++) {
      if (!kiemTraO(QUY_TAC[i])) hopLe = false;
    }
    if (hopLe) guiThanhToan();
  };
}

function moThanhToan() {
  if (cart.tongSoLuong() == 0) { alert("Giỏ hàng đang trống!"); return; }
  document.getElementById("ttTong").innerHTML = dinhDangTien(cart.tinhTong());
  document.getElementById("ketQuaThanhToan").innerHTML = "";
  document.getElementById("formThanhToan").classList.remove("an");
  document.getElementById("modalThanhToan").classList.remove("an");
  document.getElementById("miniCart").classList.add("an");
}
function dongThanhToan() {
  document.getElementById("modalThanhToan").classList.add("an");
}

// Khách hàng đăng nhập bằng customers.json → điền sẵn thông tin giao hàng
function dangNhapKhachHang() {
  var u = document.getElementById("khUser").value.trim();
  var p = document.getElementById("khPass").value;
  var tim = null;
  for (var i = 0; i < dsKhachHang.length; i++) {
    if (dsKhachHang[i].username == u && dsKhachHang[i].password == p) tim = dsKhachHang[i];
  }
  if (tim == null) {
    document.getElementById("loiDangNhapKH").innerHTML = "Sai tên đăng nhập hoặc mật khẩu";
    return;
  }
  try { sessionStorage.setItem("khachHang", JSON.stringify(tim)); } catch (e) { }
  dienThongTinKhach(tim);
}

function dienThongTinKhach(kh) {
  document.getElementById("ttHoTen").value = kh.hoTen;
  document.getElementById("ttSdt").value = kh.sdt;
  document.getElementById("ttEmail").value = kh.email;
  document.getElementById("ttDiaChi").value = kh.diaChi;
  document.getElementById("khungDangNhapKH").innerHTML = "Xin chào <b>" + kh.hoTen + "</b> (" + kh.id + ")";
  document.getElementById("xinChao").innerHTML = "Xin chào, " + kh.hoTen;
  for (var i = 0; i < QUY_TAC.length; i++) kiemTraO(QUY_TAC[i]);
}

function layKhachDangNhap() {
  try { return JSON.parse(sessionStorage.getItem("khachHang")); } catch (e) { return null; }
}

// "Gửi API" giả lập: chờ 1 giây như gọi server, sau đó lưu đơn hàng vào localStorage
function guiThanhToan() {
  var kh = layKhachDangNhap();
  var chiTiet = [];
  for (var khoa in cart.items) {
    var d = cart.items[khoa];
    var phanLoai = d.variant.split("/");
    chiTiet.push({ id: d.id, title: d.title, mauSac: phanLoai[0], size: phanLoai[1] || "", soLuong: d.soLuong, donGia: d.price });
  }
  var dsDon = docLocal("donHang", []);
  var donHang = {
    maHD: "HD" + Date.now(),
    ngayTao: new Date().toISOString().substring(0, 10),
    trangThai: "Chờ xử lý",
    nhanVien: "",
    khachHang: kh ? kh.id : "KHACH_LE",
    hoTen: document.getElementById("ttHoTen").value.trim(),
    sdt: document.getElementById("ttSdt").value.trim(),
    email: document.getElementById("ttEmail").value.trim(),
    diaChi: document.getElementById("ttDiaChi").value.trim(),
    chiTiet: chiTiet,
    tongTien: cart.tinhTong()
  };

  var ketQua = document.getElementById("ketQuaThanhToan");
  ketQua.innerHTML = "Đang xử lý thanh toán...";
  setTimeout(function () {
    dsDon.push(donHang);
    luuLocal("donHang", dsDon);
    cart.xoaHet();
    document.getElementById("formThanhToan").classList.add("an");
    ketQua.innerHTML = "<b style='color:green'>Thanh toán thành công!</b> Mã đơn: " + donHang.maHD +
      "<br>Tổng tiền: " + dinhDangTien(donHang.tongTien);
  }, 1000);
}
