package net_443.ddns.nutripilot.twa;


import com.google.androidbrowserhelper.playbilling.digitalgoods.DigitalGoodsRequestHandler;


public class DelegationService extends
        com.google.androidbrowserhelper.trusted.DelegationService {
    @Override
    public void onCreate() {
        super.onCreate();

        
            registerExtraCommandHandler(new DigitalGoodsRequestHandler(getApplicationContext()));
        
    }
}

