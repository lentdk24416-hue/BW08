// ===================== TRANG CHÍNH: RENDER + TÌM KIẾM + EVENT DELEGATION =====================
var dsSanPham = [];
var ANH_LOI = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%' height='100%' fill='#eee'/>" +
  "<text x='50%' y='50%' font-size='14' text-anchor='middle' fill='#888'>Không có ảnh</text></svg>");

function timSanPham(id) {
  for (var i = 0; i < dsSanPham.length; i++) {
    if (dsSanPham[i].id == id) return dsSanPham[i];
  }
  return null;
}

// ---------- CÂU 3: Skeleton Loading (hiện khung xám nhấp nháy trước khi có dữ liệu) ----------
function hienSkeleton(soLuong) {
  var html = "";
  for (var i = 0; i < soLuong; i++) {
    html += "<div class='the-sp skeleton'>" +
      "<div class='khung-anh'></div>" +
      "<div class='dong-xam'></div>" +
      "<div class='dong-xam ngan'></div>" +
      "<div class='dong-xam ngan'></div>" +
      "</div>";
  }
  document.getElementById("dsSanPham").innerHTML = html;
}

// ---------- Render danh sách sản phẩm ----------
function taoTheSanPham(sp) {
  var mauDau = sp.colors.length > 0 ? sp.colors[0].ten : "";
  var sizeDau = sp.sizes.length > 0 ? sp.sizes[0] : "";
  var variant = sizeDau == "" ? mauDau : mauDau + "/" + sizeDau;

  var nutMau = "";
  for (var i = 0; i < sp.colors.length; i++) {
    nutMau += "<button type='button' data-action='chon-mau' data-value='" + sp.colors[i].ten + "'" +
      (i == 0 ? " class='chon'" : "") + ">" + sp.colors[i].ten + "</button>";
  }
  var nutSize = "";
  for (var j = 0; j < sp.sizes.length; j++) {
    nutSize += "<button type='button' data-action='chon-size' data-value='" + sp.sizes[j] + "'" +
      (j == 0 ? " class='chon'" : "") + ">" + sp.sizes[j] + "</button>";
  }

  return "<article class='the-sp' data-id='" + sp.id + "' data-variant='" + variant + "'>" +
    "<div class='khung-anh'><img src='" + sp.image + "' alt='" + sp.title.replace(/'/g, "") + "' loading='lazy' " +
    "onerror=\"this.onerror=null; this.src=ANH_LOI\"></div>" +
    "<h3 title='" + sp.title.replace(/'/g, "") + "'>" + sp.title + "</h3>" +
    "<div class='gia'>" + dinhDangTien(sp.price) + "</div>" +
    "<div class='ton-kho'>Tồn kho: " + sp.stock + "</div>" +
    "<div class='chon-mau'>" + nutMau + "</div>" +
    (nutSize == "" ? "" : "<div class='chon-size'>" + nutSize + "</div>") +
    "<button type='button' class='link-rating' data-action='rating'>Rating detail</button>" +
    "<div class='nut-sp'>" +
    "<button type='button' class='btn' data-action='them-gio' data-id='" + sp.id + "' data-variant='" + variant + "'>Thêm vào giỏ hàng</button>" +
    "<button type='button' class='btn btn-phu' data-action='xem-nhanh' data-id='" + sp.id + "' data-variant='" + variant + "'>Xem nhanh</button>" +
    "</div>" +
    "</article>";
}

function hienDanhSach(ds) {
  var html = "";
  for (var i = 0; i < ds.length; i++) html += taoTheSanPham(ds[i]);
  if (html == "") html = "<p>Không tìm thấy sản phẩm phù hợp.</p>";
  document.getElementById("dsSanPham").innerHTML = html;
  document.getElementById("demKetQua").innerHTML = "(" + ds.length + " sản phẩm)";
  hienSaoTrungBinh();   // Câu 5: chèn số sao sau mỗi lần render
}

// ---------- CÂU 4: EVENT DELEGATION — CHỈ 1 LISTENER TRÊN CONTAINER CHA ----------
function ganSuKienDanhSach() {
  var container = document.getElementById("dsSanPham");
  container.addEventListener("click", function (e) {
    var nut = e.target.closest("[data-action]");   // phần tử được bấm (hoặc cha gần nhất) có data-action
    if (!nut || !container.contains(nut)) return;

    var the = nut.closest(".the-sp");
    var id = the.getAttribute("data-id");
    var variant = the.getAttribute("data-variant");
    var hanhDong = nut.getAttribute("data-action");
    var sp = timSanPham(id);

    if (hanhDong == "chon-mau" || hanhDong == "chon-size") {
      // Đánh dấu nút đang chọn
      var nhom = nut.parentNode.getElementsByTagName("button");
      for (var i = 0; i < nhom.length; i++) nhom[i].classList.remove("chon");
      nut.classList.add("chon");
      // Ghép lại variant = màu/size rồi cập nhật data-variant của thẻ và 2 nút
      var mau = the.querySelector(".chon-mau .chon").getAttribute("data-value");
      var sizeChon = the.querySelector(".chon-size .chon");
      var variantMoi = sizeChon ? mau + "/" + sizeChon.getAttribute("data-value") : mau;
      the.setAttribute("data-variant", variantMoi);
      var cacNut = the.querySelectorAll(".nut-sp button");
      for (var k = 0; k < cacNut.length; k++) cacNut[k].setAttribute("data-variant", variantMoi);
      return;
    }

    // Đọc data-id, data-variant ngay trên nút được bấm (đúng yêu cầu Câu 4)
    id = nut.getAttribute("data-id") || id;
    variant = nut.getAttribute("data-variant") || variant;
    console.log("Câu 4 → action:", hanhDong, "| data-id:", id, "| data-variant:", variant);

    if (hanhDong == "them-gio") themVaoGio(sp, variant);
    else if (hanhDong == "xem-nhanh") xemNhanh(sp, variant);
    else if (hanhDong == "rating") hienChiTietDanhGia(sp);
  });
}

function tonKhoTheoMau(sp, mau) {
  for (var i = 0; i < sp.colors.length; i++) {
    if (sp.colors[i].ten == mau) return sp.colors[i].ton;
  }
  return 0;
}

function themVaoGio(sp, variant) {
  var mau = variant.split("/")[0];
  var daCo = 0;
  for (var khoa in cart.items) {
    if (cart.items[khoa].id == sp.id && cart.items[khoa].variant.split("/")[0] == mau) daCo += cart.items[khoa].soLuong;
  }
  if (daCo >= tonKhoTheoMau(sp, mau)) {
    alert("Màu " + mau + " chỉ còn " + tonKhoTheoMau(sp, mau) + " sản phẩm trong kho.");
    return;
  }
  cart.them(sp, variant);
  document.getElementById("miniCart").classList.remove("an");
}

function xemNhanh(sp, variant) {
  var dsMau = "";
  for (var i = 0; i < sp.colors.length; i++) {
    dsMau += "<li>" + sp.colors[i].ten + ": còn " + sp.colors[i].ton + "</li>";
  }
  moModal("<img src='" + sp.image + "' alt='' onerror=\"this.onerror=null; this.src=ANH_LOI\">" +
    "<h3>" + sp.title + "</h3>" +
    "<p class='gia'>" + dinhDangTien(sp.price) + "</p>" +
    "<p>" + sp.description + "</p>" +
    "<p>Danh mục: " + sp.category + " | Đang chọn: <b>" + variant + "</b></p>" +
    "<p>Tồn kho theo màu:</p><ul>" + dsMau + "</ul>" +
    (sp.sizes.length ? "<p>Size: " + sp.sizes.join(", ") + "</p>" : "") +
    "<button type='button' class='btn' onclick=\"themVaoGio(timSanPham('" + sp.id + "'), '" + variant + "'); dongModal();\">Thêm vào giỏ hàng</button>");
}

function moModal(html) {
  document.getElementById("noiDungModal").innerHTML = html;
  document.getElementById("modal").classList.remove("an");
}
function dongModal() {
  document.getElementById("modal").classList.add("an");
}

// ---------- CÂU 2: FORM TÌM KIẾM NÂNG CAO ----------
function ganFormTimKiem() {
  var form = document.getElementById("formTim");
  form.onsubmit = function (e) {
    e.preventDefault();
    var loi = document.getElementById("loiTim");
    var giaTu = document.getElementById("giaTu");
    var giaDen = document.getElementById("giaDen");

    // Kiểm tra thêm: giá từ không được lớn hơn giá đến
    giaDen.setCustomValidity("");
    if (giaTu.value != "" && giaDen.value != "" && parseFloat(giaTu.value) > parseFloat(giaDen.value)) {
      giaDen.setCustomValidity("Giá đến phải lớn hơn hoặc bằng giá từ");
    }
    if (!form.checkValidity()) {          // dùng validation có sẵn của HTML5 (min, max, pattern, required...)
      form.reportValidity();
      loi.innerHTML = "Vui lòng kiểm tra lại điều kiện tìm kiếm.";
      return;
    }
    loi.innerHTML = "";

    var tuKhoa = document.getElementById("tuKhoa").value.trim().toLowerCase();
    var danhMuc = document.getElementById("danhMuc").value;
    var mau = document.getElementById("mauSac").value;
    var ratingMin = parseFloat(document.getElementById("rating").value);
    var tu = giaTu.value == "" ? 0 : parseFloat(giaTu.value);
    var den = giaDen.value == "" ? Infinity : parseFloat(giaDen.value);

    var ketQua = [];
    for (var i = 0; i < dsSanPham.length; i++) {
      var sp = dsSanPham[i];
      if (tuKhoa != "" && sp.title.toLowerCase().indexOf(tuKhoa) == -1) continue;
      if (danhMuc != "tatca" && sp.category != danhMuc) continue;
      if (sp.price < tu || sp.price > den) continue;
      if (mau != "" && tonKhoTheoMau(sp, mau) == 0) continue;
      var diem = diemTrungBinh(sp.id) || sp.rate;
      if (diem < ratingMin) continue;
      ketQua.push(sp);
    }
    hienDanhSach(ketQua);
  };
  form.onreset = function () {
    document.getElementById("hienRating").value = 0;
    document.getElementById("loiTim").innerHTML = "";
    setTimeout(function () { hienDanhSach(dsSanPham); }, 0);
  };
}

// ---------- KHỞI ĐỘNG ----------
window.onload = function () {
  hienSkeleton(8);
  cart.render();
  ganSuKienDanhSach();
  ganFormTimKiem();
  ganKiemTraNoiTuyen();

  docJSON("data/customers.json", function (data) {
    dsKhachHang = data.customers;
    var kh = layKhachDangNhap();
    if (kh) dienThongTinKhach(kh);
  });

  // setTimeout chỉ để thấy rõ hiệu ứng skeleton khi chạy thử; có thể bỏ
  setTimeout(function () {
    docSanPham(function (ds) {
      dsSanPham = ds;
      docDanhGia(function () {
        hienDanhSach(dsSanPham);
      });
    });
  }, 1000);
};
