import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:map_launcher/map_launcher.dart';

class AttractionDetail extends StatefulWidget {
  final String attractionName;

  const AttractionDetail({Key? key, required this.attractionName})
    : super(key: key);

  @override
  State<AttractionDetail> createState() => _AttractionDetailState();
}

class _AttractionDetailState extends State<AttractionDetail>
    with SingleTickerProviderStateMixin {
  bool isLoading = true;
  bool isSubmitting = false;
  bool hasError = false;
  String errorMessage = '';
  Map<String, dynamic> attractionData = {};
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  final TextEditingController _reviewController = TextEditingController();
  double _userRating = 0;

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );

    fetchAttractionDetails();
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _reviewController.dispose();
    super.dispose();
  }

  Future<void> fetchAttractionDetails() async {
    setState(() {
      isLoading = true;
      hasError = false;
      errorMessage = '';
    });

    final String url =
        'http://localhost:5000/api/user/attractionByname?name=${widget.attractionName}';


    try {
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {

        final jsonResponse = jsonDecode(response.body);

        if (jsonResponse is List && jsonResponse.isNotEmpty) {
          setState(() {
            attractionData = Map<String, dynamic>.from(jsonResponse[0]);
            isLoading = false;
          });
        } else if (jsonResponse is Map<String, dynamic>) {
          setState(() {
            attractionData = jsonResponse;
            isLoading = false;
          });
        } else {
          setState(() {
            isLoading = false;
            hasError = true;
            errorMessage = "No data found for ${widget.attractionName}";
          });
          print("❌ No data found for attraction");
        }
      } else {
        print("❌ Failed to fetch data. Status code: ${response.statusCode}");
        print("❌ Response body: ${response.body}");
        setState(() {
          isLoading = false;
          hasError = true;
          errorMessage = "Server error: ${response.statusCode}";
        });
      }
    } catch (e) {
      print("❌ Error fetching attraction details: $e");
      setState(() {
        isLoading = false;
        hasError = true;
        errorMessage = e.toString();
      });
    }
  }

  Future<void> submitReview() async {
    if (_reviewController.text.trim().isEmpty || _userRating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a review and select a rating'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      isSubmitting = true;
    });

    final String attractionId = attractionData['_id'] ?? '';
    if (attractionId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cannot identify attraction for review'),
          backgroundColor: Colors.red,
        ),
      );
      setState(() {
        isSubmitting = false;
      });
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    final String? userId = prefs.getString('id');

    try {
      final response = await http.post(
        Uri.parse('http://localhost:5000/api/user/addReview'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': userId,
          'AttractionId': attractionId,
          'rating': _userRating.toInt(), 
          'review': _reviewController.text,
        }),
      );

    

      if (response.statusCode == 200 || response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Review submitted successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        _reviewController.clear();
        setState(() {
          _userRating = 0;
          isSubmitting = false;
        });
        fetchAttractionDetails();
      } else {
        setState(() {
          isSubmitting = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit review: ${response.body}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      setState(() {
        isSubmitting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Widget networkImageWithErrorHandling(
    String? imageUrl, {
    double? width,
    double? height,
    BoxFit fit = BoxFit.cover,
    Widget? placeholder,
    Widget? errorWidget,
  }) {
    if (imageUrl == null || imageUrl.isEmpty) {
      return errorWidget ??
          Container(
            width: width,
            height: height,
            color: Colors.grey[800],
            child: const Icon(Icons.image, color: Colors.white60, size: 42),
          );
    }

    return Image.network(
      imageUrl,
      width: width,
      height: height,
      fit: fit,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return placeholder ??
            Center(
              child: CircularProgressIndicator(
                value:
                    loadingProgress.expectedTotalBytes != null
                        ? loadingProgress.cumulativeBytesLoaded /
                            loadingProgress.expectedTotalBytes!
                        : null,
                color: Colors.orange,
              ),
            );
      },
      errorBuilder: (context, error, stackTrace) {
        print("🖼️ Image error: $error for URL: $imageUrl");
        return errorWidget ??
            Container(
              width: width,
              height: height,
              color: Colors.grey[800],
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.broken_image, color: Colors.white60, size: 32),
                  SizedBox(height: 4),
                  Text(
                    'Image Error',
                    style: TextStyle(color: Colors.white60, fontSize: 10),
                  ),
                ],
              ),
            );
      },
    );
  }

  double _calculateAverageRating() {
    final reviews = attractionData['reviews'] as List?;
    if (reviews == null || reviews.isEmpty) return -1;

    double total = 0;
    for (var review in reviews) {
      if (review['rating'] is num) {
        total += (review['rating'] as num).toDouble();
      } else if (review['rating'] is String) {
        try {
          total += double.parse(review['rating']);
        } catch (e) {
          print("⚠️ Rating parsing error: $e");
          // Skip this rating if it can't be parsed
        }
      }
    }

    return total / reviews.length;
  }

  Future<void> openMap(double? latitude, double? longitude) async {
    final String name = attractionData['name'] ?? 'Attraction';

    if (latitude == null || longitude == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Location coordinates not available'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    try {
      final availableMaps = await MapLauncher.installedMaps;

      if (availableMaps.isEmpty) {
        final Uri googleMapsUrl = Uri.parse(
          'https://www.google.com/maps/search/?api=1&query=$latitude,$longitude',
        );

        if (await canLaunchUrl(googleMapsUrl)) {
          await launchUrl(googleMapsUrl);
        } else {
          throw 'Could not launch maps';
        }
      } else {
        if (availableMaps.length > 1) {
          showModalBottomSheet(
            context: context,
            backgroundColor: Colors.grey[900],
            builder: (BuildContext context) {
              return SafeArea(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        'Open with...',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Divider(color: Colors.grey[800]),
                    ListView.builder(
                      shrinkWrap: true,
                      itemCount: availableMaps.length,
                      itemBuilder: (context, index) {
                        return ListTile(
                          leading:
                              availableMaps[index].icon != null
                                  ? Image.memory(
                                    availableMaps[index].icon! as Uint8List,
                                    width: 24,
                                    height: 24,
                                  )
                                  : Icon(Icons.map, color: Colors.white),
                          title: Text(
                            availableMaps[index].mapName,
                            style: TextStyle(color: Colors.white),
                          ),
                          onTap: () {
                            Navigator.pop(context);
                            availableMaps[index].showMarker(
                              coords: Coords(latitude, longitude),
                              title: name,
                            );
                          },
                        );
                      },
                    ),
                  ],
                ),
              );
            },
          );
        } else {
          await availableMaps.first.showMarker(
            coords: Coords(latitude, longitude),
            title: name,
          );
        }
      }
    } catch (e) {
      print('Error opening map: $e');

      try {
        final Uri mapUrl = Uri.parse(
          'https://www.google.com/maps/search/?api=1&query=$latitude,$longitude',
        );
        if (await canLaunchUrl(mapUrl)) {
          await launchUrl(mapUrl);
        }
      } catch (e) {
        print('Fallback map opening failed: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            return Opacity(
              opacity: _fadeAnimation.value,
              child:
                  isLoading
                      ? const Center(
                        child: CircularProgressIndicator(color: Colors.orange),
                      )
                      : hasError
                      ? _buildErrorView()
                      : _buildDetailView(),
            );
          },
        ),
      ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: Colors.redAccent),
          const SizedBox(height: 16),
          const Text(
            'Error loading attraction details',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              errorMessage,
              style: const TextStyle(color: Colors.white70, fontSize: 14),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: fetchAttractionDetails,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ),
            child: const Text('Try Again'),
          ),
          const SizedBox(height: 16),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Go Back',
              style: TextStyle(
                color: Colors.orange,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailView() {
    final String name = attractionData['name'] ?? 'Unknown Attraction';
    final String description =
        attractionData['description'] ?? 'No description available.';
    final String imageUrl = attractionData['image'] ?? '';
    final double averageRating = _calculateAverageRating();
    final String category =
        attractionData['Category']?['name'] ?? 'Uncategorized';
    final String city = attractionData['City']?['name'] ?? 'Unknown Location';
    final List<dynamic> reviews = attractionData['reviews'] as List? ?? [];

    final dynamic rawLat = attractionData['latitude'];
    final dynamic rawLng = attractionData['longitude'];

    final double? latitude =
        rawLat is num
            ? rawLat.toDouble()
            : rawLat is String
            ? double.tryParse(rawLat)
            : null;

    final double? longitude =
        rawLng is num
            ? rawLng.toDouble()
            : rawLng is String
            ? double.tryParse(rawLng)
            : null;

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 250.0,
          pinned: true,
          backgroundColor: Colors.black,
          leading: IconButton(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                color: Colors.black54,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.arrow_back, color: Colors.white),
            ),
            onPressed: () => Navigator.pop(context),
          ),
          flexibleSpace: FlexibleSpaceBar(
            background: Hero(
              tag: 'attraction_${name}_image',
              child: networkImageWithErrorHandling(
                imageUrl,
                height: 250.0,
                errorWidget: Container(
                  color: Colors.grey[800],
                  child: const Center(
                    child: Icon(
                      Icons.water_drop,
                      color: Colors.white60,
                      size: 64,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),

        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title and Rating
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    if (averageRating >= 0)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.orange,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.star,
                              color: Colors.white,
                              size: 18,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              averageRating.toStringAsFixed(1),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),

                const SizedBox(height: 16),

                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        category,
                        style: const TextStyle(
                          color: Colors.blue,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Row(
                        children: [
                          const Icon(
                            Icons.location_on,
                            color: Colors.orange,
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            city,
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Description
                const Text(
                  'About',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  description,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                    height: 1.5,
                  ),
                ),

                const SizedBox(height: 32),

                // Write a Review Section
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey[900],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Write a Review',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(5, (index) {
                          return IconButton(
                            icon: Icon(
                              index < _userRating
                                  ? Icons.star
                                  : Icons.star_border,
                              color: Colors.orange,
                              size: 32,
                            ),
                            onPressed: () {
                              setState(() {
                                _userRating = index + 1;
                              });
                            },
                          );
                        }),
                      ),
                      const SizedBox(height: 12),

                      TextField(
                        controller: _reviewController,
                        style: const TextStyle(color: Colors.white),
                        maxLines: 3,
                        decoration: InputDecoration(
                          hintText: 'Share your experience...',
                          hintStyle: const TextStyle(color: Colors.grey),
                          fillColor: Colors.grey[800],
                          filled: true,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide.none,
                          ),
                          contentPadding: const EdgeInsets.all(16),
                        ),
                      ),
                      const SizedBox(height: 16),

                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: isSubmitting ? null : submitReview,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child:
                              isSubmitting
                                  ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                  : const Text(
                                    'Submit Review',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                const Text(
                  'Reviews',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),

                if (reviews.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: const [
                          Icon(
                            Icons.rate_review_outlined,
                            color: Colors.grey,
                            size: 48,
                          ),
                          SizedBox(height: 8),
                          Text(
                            'No reviews yet. Be the first to review!',
                            style: TextStyle(color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  ...reviews.map((review) => _buildReviewItem(review)).toList(),

                const SizedBox(height: 24),

                // Map button with location info
                ElevatedButton(
                  onPressed: () => openMap(latitude, longitude),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.map),
                      const SizedBox(width: 8),
                      Text(
                        latitude != null && longitude != null
                            ? 'View on Map (${latitude.toStringAsFixed(6)}, ${longitude.toStringAsFixed(6)})'
                            : 'View on Map',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildReviewItem(Map<String, dynamic> review) {
    double rating = 0.0;
    if (review['rating'] is num) {
      rating = (review['rating'] as num).toDouble();
    } else if (review['rating'] is String) {
      try {
        rating = double.parse(review['rating']);
      } catch (e) {
        print("⚠️ Rating parsing error in review item: $e");
      }
    }

    final String comment =
        review['review'] ?? review['comment'] ?? 'No comment';

    String username = 'Anonymous';
    String? profileImageUrl;

    if (review['userId'] != null && review['userId'] is Map) {
      username = review['userId']['name'] ?? 'Anonymous';
      profileImageUrl = review['userId']['profileImage'];
    } else if (review['user'] != null) {
      if (review['user'] is Map) {
        username = review['user']['name'] ?? 'Anonymous';
      } else if (review['user'] is String) {
        username = review['user'];
      }
    }

    String formattedDate = 'Unknown date';
    if (review['createdAt'] != null) {
      try {
        final DateTime date = DateTime.parse(review['createdAt']);
        formattedDate = DateFormat('MMM d, yyyy').format(date);
      } catch (e) {
        print("⚠️ Date parsing error: $e");
        formattedDate = review['createdAt'] ?? 'Unknown date';
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // UPDATED: Show profile image if available, otherwise show first letter
              profileImageUrl != null && profileImageUrl.isNotEmpty
                  ? ClipOval(
                    child: networkImageWithErrorHandling(
                      profileImageUrl,
                      width: 40,
                      height: 40,
                      fit: BoxFit.cover,
                      errorWidget: _buildDefaultAvatar(username),
                    ),
                  )
                  : _buildDefaultAvatar(username),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      username,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      formattedDate,
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  Text(
                    rating.toStringAsFixed(1),
                    style: const TextStyle(
                      color: Colors.orange,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(Icons.star, color: Colors.orange, size: 16),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            comment,
            style: const TextStyle(color: Colors.white70, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildDefaultAvatar(String username) {
    return CircleAvatar(
      backgroundColor: Colors.orange.withOpacity(0.2),
      radius: 20,
      child: Text(
        username.isNotEmpty ? username[0].toUpperCase() : 'A',
        style: const TextStyle(color: Colors.orange),
      ),
    );
  }
}
