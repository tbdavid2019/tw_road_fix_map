const fs = require('fs');
const file = '/Users/david/Documents/git/tbdavid2019/tw_pet_need_map/src/component/PetAdoptionApp.js';
let content = fs.readFileSync(file, 'utf8');

// A quick string replacement to ensure PetAdoptionApp.js handles the exact card swap logic
const targetReplacement = `isMobile={isMobile}
              handleCloseClick={handleCloseClick}
              setCondition={setCondition}
              setMapParameters={setMapParameters}
              constructionsData={petsData}
            />
          )}
        </div>
      </div>
    </div>
  );
}`;

const newContentBlock = `isMobile={isMobile}
              handleCloseClick={handleCloseClick}
              setCondition={setCondition}
              setMapParameters={setMapParameters}
              constructionsData={petsData}
            />
          )}
          {/* Begin: Mobile Redesign specific handling for Bottom Sheet Details Swap */}
          {(isMobile && mapParameters.selectMarker && !mapParameters.closeInfoWindow) && (
             <BottomSheet
                open={true}
                blocking={false}
                snapPoints={({ maxHeight }) => [140, maxHeight * 0.5, maxHeight * 0.95]}
                defaultSnap={({ maxHeight }) => 140}
                expandOnContentDrag={true}>
                  <div style={{ padding: '0 15px 15px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>寵物詳情</h3>
                      <button 
                        onClick={() => setMapParameters({...mapParameters, selectMarker: null, closeInfoWindow: true})}
                        style={{ background: 'none', border: 'none', fontSize: '24px', color: '#999', cursor: 'pointer', padding: '0 10px' }}
                      >
                        ×
                      </button>
                    </div>
                    <Card value={mapParameters.selectMarker} setMapParameters={setMapParameters} />
                  </div>
             </BottomSheet>
          )}
          {/* End: Mobile Redesign specific handling */}
        </div>
      </div>
    </div>
  );
}`;

content = content.replace(targetReplacement, newContentBlock);

fs.writeFileSync(file, content);
console.log('patched PetAdoptionApp.js to fix Card swap bug');
