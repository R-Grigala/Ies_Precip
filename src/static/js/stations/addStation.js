function openAddStationModal() {
    const modal = new bootstrap.Modal(document.getElementById('AddStationModal'));
    modal.show();
}

function refreshFilterStationSelect() {
    const stationSelect = document.getElementById('stationSelect');
    if (!stationSelect) {
        return;
    }

    makeApiRequest('/api/stations', {
        method: 'GET'
    })
        .then(data => {
            stationSelect.innerHTML = '';

            const defaultOption = document.createElement('option');
            defaultOption.textContent = 'აირჩიეთ სადგური';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            stationSelect.appendChild(defaultOption);

            if (Array.isArray(data) && data.length > 0) {
                data.forEach(station => {
                    const option = document.createElement('option');
                    option.value = station.id;
                    option.textContent = station.station_name;
                    stationSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error refreshing stations:', error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const addStationForm = document.getElementById('addStationForm');

    if (!addStationForm) {
        return;
    }

    addStationForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const submitButton = document.getElementById('submitAddStationBtn');
        submitButton.disabled = true;

        const formData = new FormData(addStationForm);
        const payload = {
            station_name: formData.get('station_name'),
            url: formData.get('url'),
            latitude: Number(formData.get('latitude')),
            longitude: Number(formData.get('longitude')),
            map_selected: Number(formData.get('map_selected')),
            map_status: document.getElementById('mapStatus').checked,
            fetch_status: document.getElementById('fetchStatus').checked
        };

        makeApiRequest('/api/stations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(data => {
                if (data && data.message) {
                    showAlert('addStationAlert', 'success', data.message);
                    showAlert('alertPlaceholder', 'success', data.message);
                    addStationForm.reset();
                    document.getElementById('mapStatus').checked = true;
                    document.getElementById('fetchStatus').checked = true;
                    refreshFilterStationSelect();
                    if (typeof loadStations === 'function') {
                        loadStations();
                    }
                    if (typeof fetchExportCSVData === 'function') {
                        fetchExportCSVData();
                    }
                } else {
                    showAlert('addStationAlert', 'danger', (data && data.error) ? data.error : 'სადგურის დამატება ვერ მოხერხდა.');
                }
            })
            .catch(error => {
                console.error('Error adding station:', error);
                showAlert('addStationAlert', 'danger', 'მოხდა შეცდომა სადგურის დამატებისას.');
            })
            .finally(() => {
                submitButton.disabled = false;
            });
    });
});
