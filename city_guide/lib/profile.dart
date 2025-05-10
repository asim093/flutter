import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ProfilePage extends StatefulWidget {
  final String? userId;

  const ProfilePage({Key? key, this.userId}) : super(key: key);

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  bool _isLoading = true;
  Map<String, dynamic> _userData = {};
  List<Map<String, dynamic>> _reviews = [];
  String? _error;
  String? _userId;

  @override
  void initState() {
    super.initState();
    _getUserIdAndFetchData();
  }

  Future<void> _getUserIdAndFetchData() async {
    try {
      String? userId = widget.userId;

      if (userId == null || userId.isEmpty) {
        final prefs = await SharedPreferences.getInstance();
        userId = prefs.getString('id');
      }

      setState(() {
        _userId = userId;
      });

      if (userId != null && userId.isNotEmpty) {
        _fetchUserData(userId);
      } else {
        setState(() {
          _error = 'User ID not found. Please login again.';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error retrieving user ID: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _fetchUserData(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('http://localhost:5000/api/user/profile?id=$userId'),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData['message'] == 'User found' &&
            responseData['data'] != null) {
          setState(() {
            _userData = responseData['data'];
            // Convert review IDs to actual review objects (mock for now)
            if (_userData['reviews'] != null && _userData['reviews'] is List) {
              _reviews = List<Map<String, dynamic>>.from(
                _userData['reviews'].map((reviewId) {
                  // Mock review data based on review IDs
                  return {
                    'id': reviewId,
                    'reviewerName':
                        'User ${reviewId.toString().substring(0, 4)}',
                    'reviewerImage': null,
                    'date':
                        '${DateTime.now().day}/${DateTime.now().month}/${DateTime.now().year}',
                    'rating': 4,
                    'comment': 'Great experience working with this person!',
                  };
                }),
              );
            }
            _isLoading = false;
          });
        } else {
          setState(() {
            _error = 'Failed to parse user data';
            _isLoading = false;
          });
        }
      } else {
        setState(() {
          try {
            final errorData = json.decode(response.body);
            _error = errorData['message'] ?? 'Failed to load user data.';
          } catch (e) {
            _error =
                'Failed to load user data. Status code: ${response.statusCode}';
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Network error: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[900],
      appBar: AppBar(
        title: const Text(
          'Profile',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              // TODO: Handle settings
            },
          ),
        ],
      ),
      body:
          _isLoading
              ? const Center(
                child: CircularProgressIndicator(color: Colors.pinkAccent),
              )
              : _error != null
              ? _buildErrorWidget()
              : _buildProfileContent(),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, color: Colors.red, size: 60),
            const SizedBox(height: 20),
            Text(
              _error!,
              style: const TextStyle(color: Colors.red, fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.pinkAccent,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
              ),
              onPressed: () => _getUserIdAndFetchData(),
              child: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileContent() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildProfileHeader(),
          const SizedBox(height: 25),
          _buildUserStats(),
          const SizedBox(height: 25),
          _buildPersonalInfo(),
          const SizedBox(height: 25),
          _buildReviewsSection(),
          const SizedBox(height: 30),
          _buildActionButtons(),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildProfileHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          Hero(
            tag: 'profile-image-${_userData['_id'] ?? ''}',
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.pinkAccent, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.pinkAccent.withOpacity(0.3),
                    blurRadius: 10,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(50),
                child:
                    _userData['profileImage'] != null
                        ? Image.network(
                          _userData['profileImage'],
                          fit: BoxFit.cover,
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return Container(
                              color: Colors.grey[800],
                              child: const Center(
                                child: CircularProgressIndicator(
                                  color: Colors.pinkAccent,
                                  strokeWidth: 2,
                                ),
                              ),
                            );
                          },
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: Colors.grey[800],
                              child: const Icon(
                                Icons.person,
                                color: Colors.white70,
                                size: 40,
                              ),
                            );
                          },
                        )
                        : Container(
                          color: Colors.grey[800],
                          child: const Icon(
                            Icons.person,
                            color: Colors.white70,
                            size: 40,
                          ),
                        ),
              ),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _userData['name'] ?? 'User',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _userData['email'] ?? 'No email provided',
                  style: TextStyle(fontSize: 14, color: Colors.grey[400]),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.pinkAccent.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.pinkAccent),
                  ),
                  child: Text(
                    _userData['Role'] ?? 'Member',
                    style: const TextStyle(
                      color: Colors.pinkAccent,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUserStats() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.3),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: Colors.grey[800]!),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildStatItem('Reviews', _reviews.length.toString()),
            _buildVerticalDivider(),
            _buildStatItem(
              'Verified',
              _userData['otp'] != null && _userData['otp']['verified'] == true
                  ? 'Yes'
                  : 'No',
            ),
            _buildVerticalDivider(),
            _buildStatItem('Member Since', '2025'),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 5),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[400])),
      ],
    );
  }

  Widget _buildVerticalDivider() {
    return Container(height: 30, width: 1, color: Colors.grey[700]);
  }

  Widget _buildPersonalInfo() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.3),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: Colors.grey[800]!),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(15),
              child: Row(
                children: [
                  const Icon(Icons.person_outline, color: Colors.pinkAccent),
                  const SizedBox(width: 10),
                  const Text(
                    'Personal Information',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(
                      Icons.edit,
                      color: Colors.pinkAccent,
                      size: 20,
                    ),
                    onPressed: () {
                      // TODO: Handle edit personal info
                    },
                  ),
                ],
              ),
            ),
            const Divider(color: Colors.grey),
            _buildInfoTile(
              Icons.badge,
              'Account ID',
              _userData['_id'] ?? 'Unknown',
            ),
            _buildInfoTile(
              Icons.phone_android,
              'Phone Number',
              _userData['phone'] ?? 'Not provided',
            ),
            _buildInfoTile(
              Icons.location_on,
              'Location',
              _userData['location'] ?? 'Not provided',
            ),
            _buildInfoTile(
              Icons.verified,
              'Verification Status',
              _userData['otp'] != null && _userData['otp']['verified'] == true
                  ? 'Verified'
                  : 'Not Verified',
              _userData['otp'] != null && _userData['otp']['verified'] == true
                  ? Colors.green
                  : Colors.orange,
            ),
            _buildInfoTile(
              Icons.info_outline,
              'Bio',
              _userData['bio'] ?? 'No bio available',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile(
    IconData icon,
    String title,
    String value, [
    Color? valueColor,
  ]) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Colors.pinkAccent, size: 22),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(color: Colors.grey[400], fontSize: 14),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    color: valueColor ?? Colors.white,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewsSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 15),
            child: Row(
              children: [
                const Icon(Icons.star_outline, color: Colors.pinkAccent),
                const SizedBox(width: 10),
                const Text(
                  'Reviews',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const Spacer(),
                Text(
                  '${_reviews.length} total',
                  style: TextStyle(color: Colors.grey[400], fontSize: 14),
                ),
              ],
            ),
          ),
          _reviews.isNotEmpty
              ? Container(
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(15),
                  border: Border.all(color: Colors.grey[800]!),
                ),
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _reviews.length > 3 ? 3 : _reviews.length,
                  separatorBuilder:
                      (context, index) => Divider(color: Colors.grey[800]),
                  itemBuilder: (context, index) {
                    return _buildReviewTile(_reviews[index]);
                  },
                ),
              )
              : Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(15),
                  border: Border.all(color: Colors.grey[800]!),
                ),
                child: Center(
                  child: Column(
                    children: [
                      const Icon(
                        Icons.rate_review_outlined,
                        color: Colors.grey,
                        size: 40,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'No reviews yet',
                        style: TextStyle(color: Colors.grey[400]),
                      ),
                    ],
                  ),
                ),
              ),
          if (_reviews.length > 3)
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: Center(
                child: TextButton(
                  onPressed: () {
                    // TODO: Show all reviews
                  },
                  child: Text(
                    'View All ${_reviews.length} Reviews',
                    style: const TextStyle(color: Colors.pinkAccent),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildReviewTile(Map<String, dynamic> review) {
    return Padding(
      padding: const EdgeInsets.all(15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: Colors.grey[800],
                backgroundImage:
                    review['reviewerImage'] != null
                        ? NetworkImage(review['reviewerImage'])
                        : null,
                child:
                    review['reviewerImage'] == null
                        ? const Icon(
                          Icons.person,
                          color: Colors.white70,
                          size: 16,
                        )
                        : null,
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    review['reviewerName'] ?? 'Anonymous',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    review['date'] ?? '',
                    style: TextStyle(color: Colors.grey[400], fontSize: 12),
                  ),
                ],
              ),
              const Spacer(),
              _buildRatingStars(review['rating'] ?? 0),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            review['comment'] ?? '',
            style: const TextStyle(color: Colors.white),
          ),
        ],
      ),
    );
  }

  Widget _buildRatingStars(int rating) {
    return Row(
      children: List.generate(5, (index) {
        return Icon(
          index < rating ? Icons.star : Icons.star_border,
          color: index < rating ? Colors.amber : Colors.grey,
          size: 16,
        );
      }),
    );
  }

  Widget _buildActionButtons() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        
      ),
    );
  }
}
