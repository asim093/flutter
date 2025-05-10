import 'dart:convert';
import 'dart:typed_data';
import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

class Signuppage extends StatefulWidget {
  const Signuppage({super.key});

  @override
  State<Signuppage> createState() => _SignuppageState();
}

class _SignuppageState extends State<Signuppage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  File? _mobileImage;
  Uint8List? _webImageBytes;
  String? _webImageName;

  Future<void> _pickImage() async {
    if (kIsWeb) {
      FilePickerResult? result = await FilePicker.platform.pickFiles(type: FileType.image, withData: true);
      if (result != null && result.files.single.bytes != null) {
        setState(() {
          _webImageBytes = result.files.single.bytes;
          _webImageName = result.files.single.name;
        });
      }
    } else {
      final picked = await ImagePicker().pickImage(source: ImageSource.gallery);
      if (picked != null) {
        setState(() {
          _mobileImage = File(picked.path);
        });
      }
    }
  }

  Future<void> signupUser() async {
    const String apiUrl = 'http://localhost:5000/api/user/Signup';
    var request = http.MultipartRequest('POST', Uri.parse(apiUrl));

    request.fields['name'] = _nameController.text.trim();
    request.fields['email'] = _emailController.text.trim();
    request.fields['password'] = _passwordController.text.trim();

    if (kIsWeb && _webImageBytes != null && _webImageName != null) {
      request.files.add(
        http.MultipartFile.fromBytes('profileImage', _webImageBytes!, filename: _webImageName),
      );
    } else if (!kIsWeb && _mobileImage != null) {
      request.files.add(await http.MultipartFile.fromPath('profileImage', _mobileImage!.path));
    }

    var response = await request.send();
    var responseData = await response.stream.bytesToString();
    var jsonData = json.decode(responseData);

    if (response.statusCode == 201) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Signup Successful")));
      Navigator.pushNamed(context, '/');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Signup Failed: ${jsonData['message'] ?? 'Something went wrong'}")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0),
        child: Center(
          child: SingleChildScrollView(
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 40),
                  const Text("Create Account",
                      style: TextStyle(fontSize: 32, fontWeight: FontWeight.w600, color: Colors.black87)),
                  const SizedBox(height: 10),
                  const Text("Please fill in the form to create an account",
                      style: TextStyle(fontSize: 16, color: Colors.grey)),
                  const SizedBox(height: 30),
                  _buildTextField(_nameController, "Full Name", Icons.person_outline, "Please enter your name"),
                  const SizedBox(height: 20),
                  _buildTextField(_emailController, "Email", Icons.email_outlined, "Please enter a valid email",
                      email: true),
                  const SizedBox(height: 20),
                  _buildTextField(_passwordController, "Password", Icons.lock_outline,
                      "Password must be at least 6 characters",
                      isPassword: true),
                  const SizedBox(height: 20),

                  GestureDetector(
                    onTap: _pickImage,
                    child: Container(
                      width: double.infinity,
                      height: 150,
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey),
                      ),
                      child: Center(
                        child: kIsWeb
                            ? (_webImageBytes != null
                                ? Image.memory(_webImageBytes!, fit: BoxFit.cover)
                                : const Text("Tap to upload profile image"))
                            : (_mobileImage != null
                                ? Image.file(
                                    _mobileImage!,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) =>
                                        const Text("Image not supported on this platform"),
                                  )
                                : const Text("Tap to upload profile image")),
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),
                  Center(
                    child: TextButton(
                      onPressed: () {
                        Navigator.pushNamed(context, '/');
                      },
                      child: const Text(
                        "Already have an account? Log In",
                        style: TextStyle(color: Colors.blue),
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          signupUser();
                        }
                      },
                      child: const Text("Sign Up", style: TextStyle(fontSize: 18, color: Colors.black54)),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint, IconData icon, String errorMsg,
      {bool isPassword = false, bool email = false}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 2))],
      ),
      child: TextFormField(
        controller: controller,
        obscureText: isPassword,
        keyboardType: email ? TextInputType.emailAddress : TextInputType.text,
        decoration: InputDecoration(
          hintText: hint,
          prefixIcon: Icon(icon),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.all(16),
        ),
        validator: (value) {
          if (value == null || value.isEmpty) return errorMsg;
          if (email && !RegExp(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").hasMatch(value)) {
            return "Please enter a valid email";
          }
          if (isPassword && value.length < 6) return errorMsg;
          return null;
        },
      ),
    );
  }
}
