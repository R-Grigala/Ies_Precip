document.addEventListener('DOMContentLoaded', function () {
    loadStations();
});

function loadStations() {
    makeApiRequest('/api/stations', {
        method: 'GET'
    })
        .then(data => {
            const stationsTable = document.getElementById('stationsTable');
            stationsTable.innerHTML = '';

            if (Array.isArray(data) && data.length > 0) {
                data.forEach(station => {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td>${station.id}</td>
                        <td>${station.station_name}</td>
                        <td>${station.latitude}</td>
                        <td>${station.longitude}</td>
                        <td>
                            ${station.map_status ? '<img src="../static/img/Icon.svg"  alt="Visible" class="map-status-icon">' : ''}
                        </td>

                        <td>
                            <button class="btn btn-sm btn-warning me-2" onclick="openEditStationModal(${station.id})">რედაქტირება</button>
                            <button class="btn btn-sm btn-danger" onclick="openDeleteStationModal(${station.id}, '${station.station_name}')">წაშლა</button>
                        </td>
                    `;

                    stationsTable.appendChild(row);
                });
            } else {
                stationsTable.innerHTML = '<tr><td colspan="6" class="text-center">სადგურები არ მოიძებნა</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error loading stations:', error);
            showAlert('stationsAlert', 'danger', 'სადგურების ჩატვირთვა ვერ მოხერხდა.');
        });
}

function toggleMapStatus(stationId, isChecked) {
    makeApiRequest(`/api/stations/${stationId}/toggle`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ map_status: isChecked })
    })
        .then(data => {
            if (data.message) {
                showAlert('stationsAlert', 'success', data.message);
            } else {
                showAlert('stationsAlert', 'danger', (data && data.error) ? data.error : 'სტატუსის განახლება ვერ მოხერხდა.');
            }
        })
        .catch(error => {
            console.error('Error updating map status:', error);
            showAlert('stationsAlert', 'danger', 'სტატუსის განახლება ვერ მოხერხდა.');
        });
}