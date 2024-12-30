import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Container, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { FaExclamationTriangle, FaCheckCircle, FaWaveSquare, FaUser } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import './App.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';  // Leaflet CSS dosyasını dahil ediyoruz

function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showMap, setShowMap] = useState(false); // Harita görünümünü kontrol eden state
  const [highlightedQuake, setHighlightedQuake] = useState(null); // Belirginleştirilen deprem

  useEffect(() => {
    axios
      .get('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=39.0&longitude=35.0&maxradiuskm=1000&limit=10')
      .then((response) => {
        const data = response.data.features;
        setEarthquakes(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('API hatası:', error);
        setLoading(false);
      });
  }, []);

  // Depremin büyüklüğüne göre ikonu ve rengini belirleyen fonksiyon
  const getIcon = (magnitude) => {
    let iconColor = 'green'; // Varsayılan yeşil
    if (magnitude >= 4) iconColor = 'red'; // 4 ve üzeri kırmızı
    else if (magnitude >= 2) iconColor = 'orange'; // 2 ile 4 arası sarı

    return <FaExclamationTriangle color={iconColor} />;
  };

  const addToFavorites = (quake) => {
    setFavorites((prevFavorites) => [...prevFavorites, quake]);
  };

  const removeFromFavorites = (quakeId) => {
    setFavorites(favorites.filter((quake) => quake.id !== quakeId));
  };

  const toggleFavorites = () => {
    setShowFavorites(!showFavorites);
  };

  const displayedEarthquakes = showFavorites ? favorites : earthquakes;

  const handleLogin = () => {
    alert(`Giriş yapıldı: ${username}`);
    setShowLogin(false);
  };

  // Harita üzerinde vurgulama yapılacak depreme odaklanma
  const handleHighlightQuake = (quake) => {
    setHighlightedQuake(quake); // Tıklanan depremi belirginleştiriyoruz
  };

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">Deprem Bilgileri</h1>

      {/* Sağ üst köşede kullanıcı girişi butonu */}
      <div className="position-fixed" style={{ top: '10px', right: '10px' }}>
        <Button
          variant="outline-primary"
          onClick={() => setShowLogin(true)}
          style={{ borderRadius: '50%' }}
        >
          <FaUser />
        </Button>
      </div>

      {/* Favorilere geçiş butonu */}
      <div className="d-flex justify-content-end mb-3">
        <Button onClick={toggleFavorites} variant="secondary">
          {showFavorites ? 'Tüm Depremleri Göster' : 'Favorilere Geçiş Yap'}
        </Button>
      </div>

      {/* Harita Gösterme Butonu */}
      <div className="d-flex justify-content-end mb-3 ">
        <Button onClick={() => setShowMap(!showMap)} variant="danger">
          {showMap ? 'Tabloya Dön' : 'Harita Görünümüne Geç'}
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p>Yükleniyor...</p>
        </div>
      ) : (
        <>
          {showMap ? (
            // Harita Görünümü
            <MapContainer center={[37.7749, -122.4194]} zoom={5} style={{ height: "500px", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {earthquakes.map((quake) => (
                <Marker
                  key={quake.id}
                  position={[
                    quake.geometry.coordinates[1], // Enlem
                    quake.geometry.coordinates[0], // Boylam
                  ]}
                  icon={L.divIcon({ className: 'leaflet-div-icon', html: getIcon(quake.properties.mag) })}
                >
                  <Popup>
                    <strong>{quake.properties.place}</strong><br />
                    Büyüklük: {quake.properties.mag}<br />
                    Tarih: {new Date(quake.properties.time).toLocaleString()}
                  </Popup>
                </Marker>
              ))}
              {/* Belirginleştirilmiş depremin harita üzerinde vurgulanması */}
              {highlightedQuake && (
                <Circle
                  center={[
                    highlightedQuake.geometry.coordinates[1], // Enlem
                    highlightedQuake.geometry.coordinates[0], // Boylam
                  ]}
                  radius={50000} // Yarıçap
                  color="blue"
                  fillColor="blue"
                  fillOpacity={0.3}
                />
              )}
            </MapContainer>
          ) : (
            // Tablo Görünümü
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tehlike Durumu</th>
                  <th>Büyüklük</th>
                  <th>Yer</th>
                  <th>Tarih</th>
                  <th>Favorilere Ekle</th>
                  <th>Haritada Görüntüle</th>
                </tr>
              </thead>
              <tbody>
                {displayedEarthquakes.map((quake, index) => (
                  <tr key={quake.id}>
                    <td>{index + 1}</td>
                    <td>{getIcon(quake.properties.mag)}</td>
                    <td>{quake.properties.mag}</td>
                    <td>{quake.properties.place}</td>
                    <td>{new Date(quake.properties.time).toLocaleString()}</td>
                    <td className='text-center'>
                      {!showFavorites && (
                        <Button onClick={() => addToFavorites(quake)} variant="primary">
                          Favoriye Ekle
                        </Button>
                      )}
                      {showFavorites && (
                        <Button onClick={() => removeFromFavorites(quake.id)} variant="danger">
                          Sil
                        </Button>
                      )}
                    </td>
                    <td className='text-center'>
                      {/* Haritada belirginleştirme butonu */}
                      <Button onClick={() => handleHighlightQuake(quake)} variant="info">
                        Haritada Görüntüle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* İkon renk açıklaması */}
          <div className="mt-4 icon-info">
            <h5>Renk Açıklamaları:</h5>
            <ul>
              <li><span style={{ color: 'green' }}>• Yeşil</span>: Büyüklük 2'den küçük depremler</li>
              <li><span style={{ color: 'orange' }}>• Turuncu</span>: Büyüklük 2 ile 4 arasındaki depremler</li>
              <li><span style={{ color: 'red' }}>• Kırmızı</span>: Büyüklük 4 ve üzerindeki depremler</li>
            </ul>
          </div>
        </>
      )}

      {/* Giriş Modali */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Kullanıcı Girişi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formUsername">
              <Form.Label>Kullanıcı Adı</Form.Label>
              <Form.Control
                type="text"
                placeholder="Kullanıcı adınızı girin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Label>Şifre</Form.Label>
              <Form.Control
                type="password"
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogin(false)}>
            Kapat
          </Button>
          <Button variant="primary" onClick={handleLogin}>
            Giriş Yap
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default App;
