//
//  PDRCore.h
//  Pandora
//
//  Created by Mac Pro on 12-12-22.
//  Copyright 2012 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PDRCoreApp.h"
#import "PGMethod.h"

@class PDRCoreAppFrame;

@interface PDRAppFeatureItem : NSObject {
    NSMutableDictionary *_extends;
}
@property(nonatomic, assign)BOOL global;
@property(nonatomic, retain)NSString *classname;
@property(nonatomic, assign)BOOL autoStart;
@property(nonatomic, retain)NSDictionary *extends;
- (void)addExtendFromDictionary:(NSDictionary*)dict;
@end

@interface PDRAppFeatureList : NSObject {
    NSMutableDictionary *_featureList;
}
- (void)load;
- (void)combineCustomFeature;
- (NSArray*)autoStartPlugins;
- (NSString*)getClassName:(NSString*)pluginName;
- (PDRAppFeatureItem*)getPuginInfo:(NSString*)pluginName;
- (NSDictionary*)getPuginExtend:(NSString*)pluginName;
@end

@interface PDRCoreFeature : NSObject {
    NSMutableDictionary* m_pWebViewPluginMap;
    NSMutableArray* _queue;
    BOOL _isJSExecuting;
}
@property (nonatomic, readonly) BOOL currentlyExecuting;
@property(nonatomic, assign) PDRCoreAppFrame* JSFrameContext;//js运行frame
@property(nonatomic, assign) PDRCoreApp* JSAppContext; //js运行所属的APP

- (id)Execute:(PGMethod*) pPadoraMethod;
- (void)execCommandsFromJs:(NSString*)pJsonString;
- (void)ProcessJSONString:(NSString*)pJsonString;
- (void)handleAppUpgradesNoClose;
- (void)handleNeedLayout;
- (void)handleAppFrameWillClose:(PDRCoreAppFrame*)appFrame;
@end

@interface PDRCoreAppFrameFeature : PDRCoreFeature
@end

@interface PDRCoreAppFeature : PDRCoreFeature
- (void)createAutoStartPlugins;
- (void)handleAppFrameWillClose:(PDRCoreAppFrame*)appFrame;
@end