import React, { useState } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const App = () => {
  const [activeTab, setActiveTab] = useState('matches');

  const renderTabContent = () => {
    switch(activeTab) {
      case 'matches':
        return <MatchesTab />;
      case 'league':
        return <LeagueTableTab />;
      default:
        return <MatchesTab />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e5006d" />
      <ScrollView style={styles.scrollView}>
        <Header />
        <MatchCards />
        <MatchdayBanner />
        <NewsHighlight />
        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
        {renderTabContent()}
        <ClubHighlight />
        <RelatedNews />
        <LatestNews />
        <LatestVideos />
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const Header = () => {
  return (
    <LinearGradient
      colors={['#e5006d', '#ff0066']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Image 
          source={{ uri: 'https://logodownload.org/wp-content/uploads/2016/03/premier-league-logo-1.png' }} 
          style={styles.premierLogo} 
          resizeMode="contain"
        />
        <Text style={styles.matchdayTitle}>Matchday Live</Text>
        <Text style={styles.dateText}>Saturday 22 February</Text>
      </View>
    </LinearGradient>
  );
};

const MatchCards = () => {
  const matches = [
    {
      id: 1,
      homeTeam: "Leicester",
      homeTeamLogo: "https://resources.premierleague.com/premierleague/badges/t13.png",
      awayTeam: "Brentford",
      awayTeamLogo: "https://resources.premierleague.com/premierleague/badges/t94.png",
      time: "03:00"
    },
    {
      id: 2,
      homeTeam: "Leicester",
      homeTeamLogo: "https://resources.premierleague.com/premierleague/badges/t13.png",
      awayTeam: "Arsenal",
      awayTeamLogo: "https://resources.premierleague.com/premierleague/badges/t3.png",
      time: "03:00"
    },
    {
      id: 3,
      homeTeam: "Leicester",
      homeTeamLogo: "https://resources.premierleague.com/premierleague/badges/t13.png",
      awayTeam: "Man Utd",
      awayTeamLogo: "https://resources.premierleague.com/premierleague/badges/t1.png",
      time: "03:00"
    }
  ];

  return (
    <View style={styles.matchCardsContainer}>
      {matches.map((match) => (
        <View key={match.id} style={styles.matchCard}>
          <View style={styles.matchContent}>
            <View style={styles.teamContainer}>
              <Text style={styles.teamName}>{match.homeTeam}</Text>
              <Image 
                source={{ uri: match.homeTeamLogo }} 
                style={styles.teamLogo} 
              />
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{match.time}</Text>
            </View>
            <View style={styles.teamContainer}>
              <Image 
                source={{ uri: match.awayTeamLogo }} 
                style={styles.teamLogo} 
              />
              <Text style={styles.teamName}>{match.awayTeam}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const MatchdayBanner = () => {
  return (
    <View style={styles.matchdayBanner}>
      <Text style={styles.matchdayBannerText}>Matchday Live</Text>
      <Text style={styles.arrowText}>→</Text>
    </View>
  );
};

const NewsHighlight = () => {
  return (
    <View style={styles.newsHighlight}>
      <Image 
        source={{ uri: 'https://resources.premierleague.com/photos/2023/02/21/0a4b7c83-c0d9-4c75-9c66-c0c9f9a8a67a/GettyImages-1247262379.jpg?width=860&height=573' }} 
        style={styles.newsHighlightImage} 
      />
      <View style={styles.newsHighlightOverlay}>
        <Text style={styles.newsHighlightTitle}>
          Watch matches Appear as he joins top five Premier League scorers
        </Text>
        <Text style={styles.newsHighlightSubtitle}>
          Leicester forward's 14th Premier League goal moves him level with Erling Haaland in the race for the Golden Boot
        </Text>
      </View>
      <View style={styles.newsHighlightGallery}>
        <Image 
          source={{ uri: 'https://resources.premierleague.com/photos/2023/02/21/0a4b7c83-c0d9-4c75-9c66-c0c9f9a8a67a/GettyImages-1247262379.jpg?width=300&height=200' }} 
          style={styles.newsHighlightGalleryImage} 
        />
        <Image 
          source={{ uri: 'https://resources.premierleague.com/photos/2023/02/21/0a4b7c83-c0d9-4c75-9c66-c0c9f9a8a67a/GettyImages-1247262379.jpg?width=300&height=200' }} 
          style={styles.newsHighlightGalleryImage} 
        />
      </View>
      <View style={styles.newsHighlightButtons}>
        <TouchableOpacity style={styles.newsHighlightButton}>
          <Text style={styles.newsHighlightButtonText}>Don't Get the corner flag</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.newsHighlightButton}>
          <Text style={styles.newsHighlightButtonText}>Don't Get the corner flag</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.newsHighlightInfo}>
        <View style={styles.newsHighlightInfoItem}>
          <View style={styles.newsHighlightInfoIcon}>
            <Text style={styles.newsHighlightInfoIconText}>GW</Text>
          </View>
          <Text style={styles.newsHighlightInfoText}>Sat, My FPL: How changes around my team this evening</Text>
        </View>
        <View style={styles.newsHighlightInfoItem}>
          <View style={styles.newsHighlightInfoIcon}>
            <Text style={styles.newsHighlightInfoIconText}>GW</Text>
          </View>
          <Text style={styles.newsHighlightInfoText}>Sat, My FPL: How changes around my team this evening</Text>
        </View>
        <View style={styles.newsHighlightInfoItem}>
          <View style={styles.newsHighlightInfoIcon}>
            <Text style={styles.newsHighlightInfoIconText}>GW</Text>
          </View>
          <Text style={styles.newsHighlightInfoText}>Sat, My FPL: How changes around my team this evening</Text>
        </View>
      </View>
    </View>
  );
};

const TabSelector = ({ activeTab, setActiveTab }) => {
  return (
    <View style={styles.tabSelector}>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'matches' && styles.activeTabButton]} 
        onPress={() => setActiveTab('matches')}
      >
        <Text style={styles.tabButtonText}>Matches</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'league' && styles.activeTabButton]} 
        onPress={() => setActiveTab('league')}
      >
        <Text style={styles.tabButtonText}>League Table</Text>
      </TouchableOpacity>
    </View>
  );
};

const MatchesTab = () => {
  return (
    <View style={styles.tabContent}>
      <View style={styles.matchweekHeader}>
        <Text style={styles.matchweekTitle}>Matchweek 28</Text>
      </View>
      <View style={styles.matchweekSubheader}>
        <Text style={styles.matchweekSubheaderText}>All times shown are your local time</Text>
      </View>
      <View style={styles.matchweekDateHeader}>
        <Text style={styles.matchweekDateText}>Saturday 09 March</Text>
      </View>
      
      {/* Matches for Saturday */}
      {[1, 2, 3, 4].map((index) => (
        <View key={index} style={styles.matchweekMatch}>
          <View style={styles.matchweekTeamContainer}>
            <Image 
              source={{ uri: 'https://resources.premierleague.com/premierleague/badges/t13.png' }} 
              style={styles.matchweekTeamLogo} 
            />
          </View>
          <View style={styles.matchweekTimeContainer}>
            <Text style={styles.matchweekTimeText}>21:00</Text>
          </View>
          <View style={styles.matchweekTeamContainer}>
            <Image 
              source={{ uri: 'https://resources.premierleague.com/premierleague/badges/t1.png' }} 
              style={styles.matchweekTeamLogo} 
            />
          </View>
          <TouchableOpacity style={styles.matchweekArrow}>
            <Text style={styles.matchweekArrowText}>→</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      <View style={styles.viewAllFixtures}>
        <Text style={styles.viewAllFixturesText}>View all fixtures →</Text>
      </View>
    </View>
  );
};

const LeagueTableTab = () => {
  const tableData = Array(12).fill().map((_, index) => ({
    position: index + 1,
    team: "Manchester United",
    teamLogo: "https://resources.premierleague.com/premierleague/badges/t1.png",
    played: 25,
    goalDifference: "+42",
    points: 60
  }));

  return (
    <View style={styles.tabContent}>
      <View style={styles.leagueTableHeader}>
        <View style={styles.leagueTableHeaderCell}>
          <Text style={styles.leagueTableHeaderText}>Pos</Text>
        </View>
        <View style={[styles.leagueTableHeaderCell, styles.leagueTableTeamCell]}>
          <Text style={styles.leagueTableHeaderText}></Text>
        </View>
        <View style={styles.leagueTableHeaderCell}>
          <Text style={styles.leagueTableHeaderText}>Pl</Text>
        </View>
        <View style={styles.leagueTableHeaderCell}>
          <Text style={styles.leagueTableHeaderText}>GD</Text>
        </View>
        <View style={styles.leagueTableHeaderCell}>
          <Text style={styles.leagueTableHeaderText}>Pts</Text>
        </View>
      </View>
      
      {tableData.map((item, index) => (
        <View key={index} style={styles.leagueTableRow}>
          <View style={styles.leagueTableCell}>
            <Text style={styles.leagueTablePositionText}>{item.position}</Text>
          </View>
          <View style={[styles.leagueTableCell, styles.leagueTableTeamCell]}>
            <Image 
              source={{ uri: item.teamLogo }} 
              style={styles.leagueTableTeamLogo} 
            />
            <Text style={styles.leagueTableTeamText}>{item.team}</Text>
          </View>
          <View style={styles.leagueTableCell}>
            <Text style={styles.leagueTableText}>{item.played}</Text>
          </View>
          <View style={styles.leagueTableCell}>
            <Text style={styles.leagueTableText}>{item.goalDifference}</Text>
          </View>
          <View style={styles.leagueTableCell}>
            <Text style={styles.leagueTableText}>{item.points}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const ClubHighlight = () => {
  return (
    <View style={styles.clubHighlight}>
      <LinearGradient
        colors={['#DA020E', '#C70000']}
        style={styles.clubHighlightGradient}
      >
        <View style={styles.clubHighlightContent}>
          <Image 
            source={{ uri: 'https://resources.premierleague.com/premierleague/badges/t1.png' }} 
            style={styles.clubHighlightLogo} 
          />
          <Text style={styles.clubHighlightName}>Manchester United</Text>
          <TouchableOpacity style={styles.clubHighlightButton}>
            <Text style={styles.clubHighlightButtonText}>Official site</Text>
            <Text style={styles.clubHighlightButtonIcon}>↗</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const RelatedNews = () => {
  const newsItems = [
    {
      id: 1,
      title: "Club News: What's changing things at Carrington",
      logo: "https://resources.premierleague.com/premierleague/badges/t1.png"
    },
    {
      id: 2,
      title: "Rashford: What's changing things at Carrington",
      logo: "https://resources.premierleague.com/premierleague/badges/t1.png"
    },
    {
      id: 3,
      title: "Club News: What's changing things at Carrington",
      logo: "https://resources.premierleague.com/premierleague/badges/t1.png"
    }
  ];

  return (
    <View style={styles.relatedNews}>
      <Text style={styles.sectionTitle}>Related News</Text>
      {newsItems.map((item) => (
        <View key={item.id} style={styles.relatedNewsItem}>
          <Image 
            source={{ uri: item.logo }} 
            style={styles.relatedNewsLogo} 
          />
          <Text style={styles.relatedNewsTitle}>{item.title}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.moreButton}>
        <Text style={styles.moreButtonText}>More News →</Text>
      </TouchableOpacity>
    </View>
  );
};

const LatestNews = () => {
  const newsItems = [
    {
      id: 1,
      title: "Live blog: Memorable updates: Dunk, Isak, Maddison out for 'weeks'",
      image: "https://resources.premierleague.com/photos/2023/02/21/0a4b7c83-c0d9-4c75-9c66-c0c9f9a8a67a/GettyImages-1247262379.jpg?width=300&height=200"
    },
    {
      id: 2,
      title: "Live blog: Memorable updates: Dunk, Isak, Maddison out for 'weeks'",
      image: "https://resources.premierleague.com/photos/2023/02/21/0a4b7c83-c0d9-4c75-9c66-c0c9f9a8a67a/GettyImages-1247262379.jpg?width=300&height=200"
    },
    {
      id: 3,
      title: "Live blog: Memorable updates: Dunk, Isak, Maddison out for 'weeks'",
      image: "https://resources.premierleague.com/photos/2023/02/21/0a4b7c83-c0d9-4c75-9c66-c0c9f9a8a67a/GettyImages-1247262379.jpg?width=300&height=200"
    }
  ];

  return (
    <View style={styles.latestNews}>
      <Text style={styles.sectionTitle}>Latest News</Text>
      {newsItems.map((item) => (
        <View key={item.id} style={styles.latestNewsItem}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.latestNewsImage} 
          />
          <Text style={styles.latestNewsTitle}>{item.title}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.moreButton}>
        <Text style={styles.moreButtonText}>More News →</Text>
      </TouchableOpacity>
    </View>
  );
};

const LatestVideos = () => {
  const videoItems = [
    {
      id: 1,
      title: "Live blog: Memorable updates: Dunk, Isak, Maddison out for 'weeks'",
      image: "https://resources.premierleague.com/photos/2023/02/21/0a4b7c83-c0d9-4c75-9c66-c0c9f9a8a67a/GettyImages-1247262379.jpg?width=300&height=200"
    },
    {
      id: 2,
      title: "Live blog: Memorable updates: Dunk, Isak, Maddison out for 'weeks'",
      image: "https://resources.premierleague.com/photos/2023/02/21/0a4b7c83-c0d9-4c75-9c66-c0c9f9a8a67a/GettyImages-1247262379.jpg?width=300&height=200"
    },
    {
      id: 3,
      title: "Live blog: Memorable updates: Dunk, Isak, Maddison out for 'weeks'",
      image: "https://resources.premierleague.com/photos/2023/02/21/0a4b7c83-c0d9-4c75-9c66-c0c9f9a8a67a/GettyImages-1247262379.jpg?width=300&height=200"
    }
  ];

  return (
    <View style={styles.latestVideos}>
      <Text style={styles.sectionTitle}>Latest Videos</Text>
      {videoItems.map((item) => (
        <View key={item.id} style={styles.latestVideoItem}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.latestVideoImage} 
          />
          <Text style={styles.latestVideoTitle}>{item.title}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.moreButton}>
        <Text style={styles.moreButtonText}>More Videos →</Text>
      </TouchableOpacity>
    </View>
  );
};

const BottomNavigation = () => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem}>
        <Image 
          source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/news.png' }} 
          style={styles.navIcon} 
        />
        <Text style={[styles.navText, styles.activeNavText]}>Latest</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Image 
          source={{ uri: 'https://img.icons8.com/ios-filled/50/999999/football2.png' }} 
          style={styles.navIcon} 
        />
        <Text style={styles.navText}>Matches</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Image 
          source={{ uri: 'https://img.icons8.com/ios-filled/50/999999/bar-chart.png' }} 
          style={styles.navIcon} 
        />
        <Text style={styles.navText}>Tables</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Image 
          source={{ uri: 'https://img.icons8.com/ios-filled/50/999999/fantasy.png' }} 
          style={styles.navIcon} 
        />
        <Text style={styles.navText}>Fantasy</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Image 
          source={{ uri: 'https://img.icons8.com/ios-filled/50/999999/menu-2.png' }} 
          style={styles.navIcon} 
        />
        <Text style={styles.navText}>More</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  premierLogo: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  matchdayTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dateText: {
    color: 'white',
    fontSize: 16,
  },
  matchCardsContainer: {
    backgroundColor: '#e5006d',
    paddingBottom: 10,
  },
  matchCard: {
    backgroundColor: 'white',
    margin: 10,
    marginBottom: 5,
    borderRadius: 10,
    padding: 15,
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  teamLogo: {
    width: 25,
    height: 25,
  },
  teamName: {
    fontSize: 14,
    marginHorizontal: 10,
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  matchdayBanner: {
    backgroundColor: '#e5006d',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchdayBannerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrowText: {
    color: 'white',
    fontSize: 18,
  },
  newsHighlight: {
    margin: 10,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  newsHighlightImage: {
    width: '100%',
    height: 200,
  },
  newsHighlightOverlay: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  newsHighlightTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  newsHighlightSubtitle: {
    color: '#ccc',
    fontSize: 14,
  },
  newsHighlightGallery: {
    flexDirection: 'row',
    padding: 10,
  },
  newsHighlightGalleryImage: {
    width: '48%',
    height: 80,
    marginRight: '4%',
    borderRadius: 5,
  },
  newsHighlightButtons: {
    flexDirection: 'row',
    padding: 10,
    paddingTop: 0,
  },
  newsHighlightButton: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  newsHighlightButtonText: {
    fontSize: 12,
  },
  newsHighlightInfo: {
    padding: 10,
  },
  newsHighlightInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  newsHighlightInfoIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#37003c',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  newsHighlightInfoIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  newsHighlightInfoText: {
    fontSize: 14,
    flex: 1,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  activeTabButton: {
    backgroundColor: '#00b2ff',
  },
  tabButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  tabContent: {
    margin: 10,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  matchweekHeader: {
    backgroundColor: '#00b2ff',
    padding: 15,
  },
  matchweekTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  matchweekSubheader: {
    padding: 10,
    backgroundColor: '#f2f2f2',
  },
  matchweekSubheaderText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  matchweekDateHeader: {
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  matchweekDateText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  matchweekMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  matchweekTeamContainer: {
    width: 40,
    alignItems: 'center',
  },
  matchweekTeamLogo: {
    width: 25,
    height: 25,
  },
  matchweekTimeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  matchweekTimeText: {
    fontWeight: 'bold',
  },
  matchweekArrow: {
    width: 30,
    alignItems: 'center',
  },
  matchweekArrowText: {
    fontSize: 16,
  },
  viewAllFixtures: {
    padding: 15,
    alignItems: 'center',
  },
  viewAllFixturesText: {
    color: '#00b2ff',
    fontWeight: 'bold',
  },
  leagueTableHeader: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  leagueTableHeaderCell: {
    width: 40,
    alignItems: 'center',
  },
  leagueTableTeamCell: {
    flex: 1,
    alignItems: 'flex-start',
  },
  leagueTableHeaderText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#666',
  },
  leagueTableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    alignItems: 'center',
  },
  leagueTableCell: {
    width: 40,
    alignItems: 'center',
  },
  leagueTablePositionText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  leagueTableTeamLogo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  leagueTableTeamText: {
    fontSize: 14,
  },
  leagueTableText: {
    fontSize: 14,
  },
  clubHighlight: {
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  clubHighlightGradient: {
    padding: 20,
  },
  clubHighlightContent: {
    alignItems: 'center',
  },
  clubHighlightLogo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  clubHighlightName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  clubHighlightButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  clubHighlightButtonText: {
    color: 'white',
    marginRight: 5,
  },
  clubHighlightButtonIcon: {
    color: 'white',
  },
  relatedNews: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  relatedNewsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  relatedNewsLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  relatedNewsTitle: {
    flex: 1,
    fontSize: 14,
  },
  moreButton: {
    alignItems: 'center',
    marginTop: 5,
  },
  moreButtonText: {
    color: '#00b2ff',
    fontWeight: 'bold',
  },
  latestNews: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  latestNewsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  latestNewsImage: {
    width: 80,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  latestNewsTitle: {
    flex: 1,
    fontSize: 14,
  },
  latestVideos: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 80, // Extra space for bottom navigation
  },
  latestVideoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  latestVideoImage: {
    width: 80,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  latestVideoTitle: {
    flex: 1,
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: 5,
    tintColor: '#999',
  },
  navText: {
    color: '#999',
    fontSize: 12,
  },
  activeNavText: {
    color: '#37003c',
  },
});

export default App;