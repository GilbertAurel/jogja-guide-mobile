import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, TextInput, FlatList} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetchDiscovery} from '../../../redux/actions';

import {COLORS, FONTS, SIZES, SERVER} from '../../../constants';
import {getDistance} from 'geolib';

export function index(props) {
  const [loading, setLoading] = useState(true);
  const [attractions, setAttractions] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const {discovery, currentLocation} = props;

    if (!discovery) {
      const url = `${SERVER}/attractions/attraction.json`;

      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          setAttractions(json);
          setLoading(false);
          props.fetchDiscovery(json);
        })
        .catch((error) => console.log(error));
    } else {
      setAttractions(discovery);
      setLoading(false);
    }

    setCurrentLocation(currentLocation);
  }, []);

  function renderSearch() {
    return (
      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          color={COLORS.primary}
          size={SIZES.icon * 0.8}
          style={{
            position: 'absolute',
            elevation: 1,
            left: SIZES.paddingNormal * 3,
          }}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="where are you going?"
        />
        <View
          style={{
            position: 'absolute',
            elevation: 1,
            right: SIZES.paddingNormal * 3,
          }}>
          <MaterialIcons
            name="tune"
            color={COLORS.primary}
            size={SIZES.icon * 0.8}
          />
        </View>
      </View>
    );
  }

  function renderAttractions() {
    const renderItem = ({item}) => {
      const distance = () => {
        const kilometer = getDistance(currentLocation, item.coordinate) * 0.001;

        if (kilometer > 50) return '50km+';
        else return `${Math.floor(kilometer)}km`;
      };

      const priceRating = () => {
        if (item.price == 'affordable') return 1;
        else if (item.price == 'fair') return 2;
        else return 3;
      };

      return (
        <View style={{...styles.itemContainer, ...styles.dropShadow}}>
          {/* Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: `${SERVER}/${item.imageURL}`,
              }}
              resizeMode="cover"
              style={styles.image}
            />
          </View>

          {/* Attraction title */}
          <Text
            style={{
              ...FONTS.body1,
              color: COLORS.black,
              marginTop: SIZES.paddingNormal,
            }}>
            {item.title}
          </Text>

          {/* location */}
          <Text style={{...FONTS.body2, color: COLORS.black}}>
            {item.address}
          </Text>

          {/* details */}
          <View
            style={{
              position: 'absolute',
              bottom: SIZES.paddingNormal,
              flexDirection: 'row',
              width: '80%',
              justifyContent: 'space-between',
            }}>
            {/* rating */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <MaterialIcons
                name="star"
                size={SIZES.icon * 0.7}
                color={COLORS.yellow}
              />
              <Text style={{...FONTS.body2}}>{item.rating}</Text>
            </View>

            {/* distance */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <MaterialIcons
                name="directions-run"
                size={SIZES.icon * 0.7}
                color={COLORS.primary}
              />
              <Text style={{...FONTS.body2}}>{distance()}</Text>
            </View>

            {/* render dollar sign */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {[1, 2, 3].map((rating) => (
                <Text
                  key={rating}
                  style={{
                    ...FONTS.body2,
                    color:
                      rating <= priceRating()
                        ? COLORS.black
                        : COLORS.mediumgray,
                  }}>
                  $
                </Text>
              ))}
            </View>
          </View>
        </View>
      );
    };

    return (
      <View style={styles.listContainer}>
        <FlatList
          data={attractions}
          keyExtractor={(item) => `${item.id}-${item.title}`}
          renderItem={renderItem}
          numColumns={2}
          ListHeaderComponent={() => {
            return <View style={{height: SIZES.paddingNormal}} />;
          }}
          ListFooterComponent={() => {
            return <View style={{height: SIZES.height * 0.08}} />;
          }}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <View
          style={{
            alignItems: 'center',
          }}>
          <Text style={{...FONTS.h2, color: COLORS.gray, marginTop: 10}}>
            Loading..
          </Text>
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        {renderSearch()}
        {renderAttractions()}
      </View>
    );
  }
}

const mapStateToProps = (store) => ({
  discovery: store.discoveryState.item,
  currentLocation: store.discoveryState.currentLocation,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({fetchDiscovery}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(index);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightgray,
  },
  searchContainer: {
    height: SIZES.height * 0.08,
    width: SIZES.width,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    height: '50%',
    width: SIZES.width * 0.9,
    borderRadius: SIZES.radius,
    paddingVertical: 0,
    paddingHorizontal: SIZES.paddingNormal,
    backgroundColor: COLORS.white,
    ...FONTS.body2,
    textAlign: 'center',
  },
  listContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    height: SIZES.height * 0.32,
    width: SIZES.width * 0.44,
    marginHorizontal: (SIZES.width * 0.05) / 3,
    marginVertical: (SIZES.width * 0.05) / 3,
    borderRadius: SIZES.radius * 0.5,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  imageContainer: {
    height: '60%',
    width: '100%',
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: SIZES.radius * 0.5,
    borderTopRightRadius: SIZES.radius * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
    borderTopLeftRadius: SIZES.radius * 0.5,
    borderTopRightRadius: SIZES.radius * 0.5,
  },
  dropShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});
