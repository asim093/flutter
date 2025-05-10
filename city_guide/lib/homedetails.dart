import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:velocity_x/velocity_x.dart';

class CityDetailsPage extends StatelessWidget {
  final String cityName;
  final String cityImage;

  CityDetailsPage({required this.cityName, required this.cityImage});

  final List<String> sampleImages = [
    'assets/images/karachi.jpg',
    'assets/images/isd.jpg',
    'assets/images/cover1.jpg',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: const Color.fromARGB(255, 192, 192, 192),
            expandedHeight: 300,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                cityName,
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  shadows: [
                    Shadow(
                      offset: Offset(1.0, 1.0),
                      blurRadius: 3.0,
                      color: Colors.black45,
                    ),
                  ],
                ),
              ),
              background: Hero(
                tag: cityName,
                child: ClipRRect(
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(30),
                    bottomRight: Radius.circular(30),
                  ),
                  child: Image.asset(
                    cityImage,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
          ),
          SliverList(
            delegate: SliverChildListDelegate([
              20.heightBox,
              _buildImageCarousel(),
              20.heightBox,
              _buildSectionTitle("Events"),
              _buildHorizontalListView(context, "Event"),
              20.heightBox,
              _buildSectionTitle("Hotels"),
              _buildHorizontalListView(context, "Hotel"),
              20.heightBox,
              _buildSectionTitle("Tourist Places"),
              _buildHorizontalListView(context, "Place"),
              20.heightBox,
              _buildSectionTitle("Location on Map"),
              _buildMapSection(),
              30.heightBox,
            ]),
          ),
        ],
      ),
    );
  }

  Widget _buildImageCarousel() {
    return CarouselSlider(
      options: CarouselOptions(
        height: 200.0,
        enlargeCenterPage: true,
        autoPlay: true,
        aspectRatio: 16 / 9,
        autoPlayCurve: Curves.fastOutSlowIn,
        enableInfiniteScroll: true,
        autoPlayAnimationDuration: Duration(milliseconds: 800),
      ),
      items: sampleImages.map((item) => Container(
        child: ClipRRect(
          borderRadius: BorderRadius.circular(15),
          child: Image.asset(item, fit: BoxFit.cover, width: double.infinity),
        ),
      )).toList(),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: title.text.xl.bold.make(),
    );
  }

  Widget _buildHorizontalListView(BuildContext context, String type) {
    return Container(
      height: 150,
      margin: EdgeInsets.symmetric(vertical: 10),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 5,
        itemBuilder: (context, index) {
          return GestureDetector(
            onTap: () {
              _showDetailsBottomSheet(context, type, index);
            },
            child: Container(
              width: 130,
              margin: EdgeInsets.only(left: 16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(15),
                color: Colors.grey[200],
                image: DecorationImage(
                  image: AssetImage('assets/images/cover1.jpg'),
                  fit: BoxFit.cover,
                ),
              ),
              child: Align(
                alignment: Alignment.bottomCenter,
                child: "$type $index"
                    .text
                    .white
                    .bold
                    .make()
                    .p8()
                    .box
                    .color(Colors.black45)
                    .roundedLg
                    .make(),
              ),
            ),
          );
        },
      ),
    );
  }

void _showDetailsBottomSheet(BuildContext context, String type, int index) {
  final times = [
    "8:00 AM - 6:00 PM",
    "10:00 AM - 8:00 PM",
    "24 Hours",
    "9:00 AM - 10:00 PM"
  ];

  final locations = [
    "Main City Center",
    "North Avenue Road",
    "Hillview Park Area",
    "Old Town District"
  ];

  final ratings = [4.1, 4.8, 3.9, 4.5];

  final imageList = [
    'assets/images/cover1.jpg',
    'assets/images/cover1.jpg',
    'assets/images/cover1.jpg',
    'assets/images/cover1.jpg',
  ];

  final selectedTime = times[index % times.length];
  final selectedLocation = locations[index % locations.length];
  final selectedRating = ratings[index % ratings.length];
  final selectedImage = imageList[index % imageList.length];

  showGeneralDialog(
    context: context,
    barrierLabel: "Details",
    barrierDismissible: true,
    transitionDuration: Duration(milliseconds: 400),
    pageBuilder: (context, anim1, anim2) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Material(
            color: Colors.transparent,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CityDetailCard(
                  title: "$type $index",
                  description:
                      "Explore the beauty and vibes of $type number $index. Discover more inside.",
                  imageUrl: imageList[index],
                  time: selectedTime,
                  location: selectedLocation,
                  rating: selectedRating,
                ),
                SizedBox(height: 20),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.redAccent,
                    shape: StadiumBorder(),
                  ),
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text("Close", style: TextStyle(color: Colors.white)),
                )
              ],
            ),
          ),
        ),
      );
    },
    transitionBuilder: (context, anim1, anim2, child) {
      return FadeTransition(
        opacity: anim1,
        child: ScaleTransition(
          scale: CurvedAnimation(parent: anim1, curve: Curves.easeOutBack),
          child: child,
        ),
      );
    },
  );
}



  Widget _buildMapSection() {
    return Container(
      margin: EdgeInsets.all(16),
      height: 200,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: Colors.grey[300],
        image: DecorationImage(
          image: AssetImage('assets/images/map_sample.jpg'),
          fit: BoxFit.cover,
        ),
      ),
      child: Center(
        child: Icon(Icons.location_on, size: 50, color: Colors.redAccent),
      ),
    );
  }
}

class CityDetailCard extends StatefulWidget {
  final String title;
  final String description;
  final String imageUrl;
  final String time;
  final String location;
  final double rating;

  const CityDetailCard({
    super.key,
    required this.title,
    required this.description,
    required this.imageUrl,
    required this.time,
    required this.location,
    required this.rating,
  });

  @override
  State<CityDetailCard> createState() => _CityDetailCardState();
}

class _CityDetailCardState extends State<CityDetailCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _animation;

  @override
  void initState() {
    super.initState();
    _controller =
        AnimationController(vsync: this, duration: Duration(milliseconds: 600));
    _animation = Tween<Offset>(
      begin: Offset(0, 1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SlideTransition(
      position: _animation,
      child: Material(
        borderRadius: BorderRadius.circular(20),
        elevation: 8,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            color: Colors.white,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius:
                    BorderRadius.vertical(top: Radius.circular(20)),
                child: Image.asset(widget.imageUrl,
                    height: 180, width: double.infinity, fit: BoxFit.cover),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.title,
                        style: TextStyle(
                            fontSize: 22, fontWeight: FontWeight.bold)),
                    SizedBox(height: 8),
                    Text(widget.description,
                        style: TextStyle(color: Colors.grey[700])),
                    SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.access_time, color: Colors.grey),
                            SizedBox(width: 4),
                            Text(widget.time),
                          ],
                        ),
                        Row(
                          children: [
                            Icon(Icons.location_on, color: Colors.grey),
                            SizedBox(width: 4),
                            Text(widget.location),
                          ],
                        ),
                        Row(
                          children: [
                            Icon(Icons.star, color: Colors.amber),
                            SizedBox(width: 4),
                            Text(widget.rating.toString()),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
