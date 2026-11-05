// ===================== CÂU 1: ĐỌC DỮ LIỆU XML / JSON =====================
// Lưu ý: phải mở trang qua web server (Live Server / GitHub Pages), không mở file:// trực tiếp,
// vì trình duyệt chặn XMLHttpRequest đọc file cục bộ.

// Tải 1 file bằng AJAX (giống slide 10: XMLHttpRequest + onreadystatechange)
function taiFile(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        callback(xhr);
      } else {
        alert("Không tải được file " + url);
      }
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}

// Lấy nội dung text của thẻ con đầu tiên có tên tenThe (childNodes[0].nodeValue)
function layText(node, tenThe) {
  var ds = node.getElementsByTagName(tenThe);
  if (ds.length == 0 || ds[0].childNodes.length == 0) return "";
  return ds[0].childNodes[0].nodeValue;
}

// Đọc data/products.xml -> mảng object sản phẩm
function docSanPham(callback) {
  taiFile("data/products.xml", function (xhr) {
    var xmlDoc = xhr.responseXML;
    var dsThe = xmlDoc.getElementsByTagName("product");
    var ketQua = [];
    for (var i = 0; i < dsThe.length; i++) {
      var p = dsThe[i];
      var rating = p.getElementsByTagName("rating")[0];
      var dsMauThe = p.getElementsByTagName("color");
      var dsMau = [];
      for (var k = 0; k < dsMauThe.length; k++) {
        dsMau.push({
          ten: dsMauThe[k].getAttribute("name"),
          ton: parseInt(dsMauThe[k].getAttribute("stock"))
        });
      }
      var chuoiSize = layText(p, "sizes");
      ketQua.push({
        id: p.getAttribute("id"),
        title: layText(p, "title"),
        price: parseFloat(layText(p, "price")),
        description: layText(p, "description"),
        category: layText(p, "category"),
        image: layText(p, "image"),
        rate: parseFloat(rating.getAttribute("rate")),
        count: parseInt(rating.getAttribute("count")),
        colors: dsMau,
        sizes: chuoiSize == "" ? [] : chuoiSize.split(","),
        stock: parseInt(layText(p, "stock"))
      });
    }
    callback(ketQua);
  });
}

// Đọc file JSON (employees.json, customers.json)
function docJSON(url, callback) {
  taiFile(url, function (xhr) {
    callback(JSON.parse(xhr.responseText));
  });
}

// Định dạng tiền
function dinhDangTien(so) {
  return "$" + so.toFixed(2);
}

// localStorage có thể bị chặn (chế độ ẩn danh...) nên bọc try/catch
function luuLocal(khoa, giaTri) {
  try { localStorage.setItem(khoa, JSON.stringify(giaTri)); } catch (e) { }
}
function docLocal(khoa, macDinh) {
  try {
    var s = localStorage.getItem(khoa);
    return s ? JSON.parse(s) : macDinh;
  } catch (e) {
    return macDinh;
  }
}
