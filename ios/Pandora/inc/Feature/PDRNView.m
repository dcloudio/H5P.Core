//
//  PDRNView.m
//  Pandora
//
//  Created by Pro_C Mac on 13-4-7.
//
//

#import "PDRNView.h"

@implementation PDRJSContext

@end

@implementation PDRNView

@synthesize JSContext;
@synthesize  options = _viewOptions;
@synthesize jsUUID, viewController, ID, identity, jsCallbackId, parent;

- (NSData*)getMettics:( PGMethod*) pMethod
{
    NSData* pRetData = nil;
    NSString* pLocalString = [NSString
                              stringWithFormat:@"{left:%f, top:%f, width:%f, height:%f}",
                              self.frame.origin.x,
                              self.frame.origin.y,
                              self.frame.size.width,
                              self.frame.size.height];
    pRetData = [pLocalString dataUsingEncoding: NSUTF8StringEncoding];
    return pRetData;
}

- (NSDictionary*)GetMiniControllerSize:(int)nOri
{
    NSDictionary* pDictionary = [NSDictionary dictionaryWithObjects:[NSArray arrayWithObjects:@"auto",@"auto",@"100%",@"10%", nil]
                                                             forKeys:[NSArray arrayWithObjects:@"left",@"top",@"width",@"height", nil]];
    return pDictionary;
}

//- (PDRNView*) initWithWebView:(PDRCoreAppFrame*)theWebView settings:(NSDictionary*)classSettings {return nil;}
//- (PDRNView*) initWithWebView:(PDRCoreAppFrame*)theWebView {return nil;}
- (id)initWithOptions:(NSDictionary*)aOptios
{
    self = [super initWithFrame:CGRectZero];
    if (self) {
        if ( [aOptios isKindOfClass:[NSDictionary class]] ) {
            _viewOptions = [[NSMutableDictionary dictionaryWithDictionary:aOptios] retain];
        }
    }
    return self;
}
- (void)CreateView:(PGMethod*)pMethod {}

- (void)onRemoveFormSuperView {
    
}

- (NSString*)getObjectString
{
    return nil;
}

- (void)dispatchEvent:(NSString*)evtName {
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];
    [dict setObject:evtName forKey:@"evt"];
    PDRPluginResult *result = [PDRPluginResult resultWithStatus:PDRCommandStatusOK messageAsDictionary:dict];
    [result setKeepCallback:YES];
    [self.JSContext toCallback:self.jsCallbackId withReslut:[result toJSONString]];
}

- (void)dealloc {
    self.JSContext = nil;
    self.parent = nil;
    [_viewOptions removeAllObjects];
    [_viewOptions release];
    self.jsCallbackId = nil;
    self.jsUUID = nil;
    self.ID = nil;
    self.identity = nil;
    [super dealloc];
}


@end
